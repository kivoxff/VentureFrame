const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const { FieldValue, Timestamp } = require("firebase-admin/firestore");

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

exports.createNewUser = functions.auth.user().onCreate(async (user) => {
  try {
    await admin.auth().setCustomUserClaims(user.uid, {
      roles: ["user"],
    });

    const userRef = db.collection("users").doc(user.uid);

    await userRef.set({
      userId: user.uid,
      displayName: user.displayName ?? null,
      email: user.email,
      photoURL: user.photoURL ?? null,
      roles: ["user"],
      userStatus: "active",
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log("User created in Firestore:", user.uid);
  } catch (err) {
    console.error("Error creating user:", err.message);
  }
});

exports.createNewSeller = functions.https.onCall(async (data, context) => {
  try {
    const sellerRef = db.collection("sellers").doc();
    const userRef = db.collection("users").doc(context.auth.uid);

    await userRef.update({
      sellerId: sellerRef.id,
    });

    await sellerRef.set({
      ...data,
      ownerId: context.auth.uid,
      sellerId: sellerRef.id,
      sellerStatus: "DRAFT",
    });

    console.log("Seller created in Firestore:", sellerRef.id);
    return sellerRef.id;
  } catch (err) {
    console.error("Error creating seller:", err.message);
  }
});

exports.submitSellerApplication = functions.https.onCall(async (_, context) => {
  try {
    const docSnap = await db
      .collection("sellers")
      .where("ownerId", "==", context.auth.uid)
      .limit(1)
      .get();
    const sellerRef = docSnap.docs[0].ref;

    await sellerRef.update({
      sellerStatus: "PENDING",
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("Error submiting application", err.message);
  }
});

exports.submitSellerKYC = functions.https.onCall(async (_, context) => {
  try {
    const docSnap = await db
      .collection("sellers")
      .where("ownerId", "==", context.auth.uid)
      .limit(1)
      .get();

    const sellerRef = docSnap.docs[0].ref;
    const sid = docSnap.docs[0].id;
    const kycRef = db.collection("sellers").doc(sid).collection("kyc").doc(sid);

    await kycRef.update({
      kycStatus: "UNDER_REVIEW",
      updatedAt: FieldValue.serverTimestamp(),
    });

    await sellerRef.update({
      kycStatus: "UNDER_REVIEW",
    });
  } catch (err) {
    console.error("Error submiting kyc", err.message);
  }
});

exports.rejectSeller = functions.https.onCall(async (data, context) => {
  const { sid, reason } = data;

  try {
    const sellerRef = db.collection("sellers").doc(sid);
    await sellerRef.update({
      sellerStatus: "REJECTED",
      rejectReason: reason,
    });
  } catch (err) {
    console.error("Error declining seller", err.message);
  }
});

exports.approveSeller = functions.https.onCall(async (data, context) => {
  const { sid } = data;

  try {
    const sellerRef = db.collection("sellers").doc(sid);
    await sellerRef.update({
      sellerStatus: "KYC_PENDING",
    });
  } catch (err) {
    console.error("Error approving seller", err.message);
  }
});

exports.rejectKYC = functions.https.onCall(async (data, context) => {
  const { sid, reason } = data;

  try {
    const sellerRef = db.collection("sellers").doc(sid);
    const kycRef = db.collection("sellers").doc(sid).collection("kyc").doc(sid);

    await sellerRef.update({
      kycStatus: "REJECTED",
    });

    await kycRef.update({
      kycStatus: "REJECTED",
      rejectReason: reason,
    });
  } catch (err) {
    console.error("Error Rejecting KYC", err.message);
  }
});

exports.approveKYC = functions.https.onCall(async (data, context) => {
  const { sid, uid } = data;

  try {
    const sellerRef = db.collection("sellers").doc(sid);
    const kycRef = sellerRef.collection("kyc").doc(sid);
    const userRef = db.collection("users").doc(uid);

    await sellerRef.update({
      sellerStatus: "ACTIVE",
      kycStatus: "VERIFIED",
    });

    await kycRef.update({
      kycStatus: "VERIFIED",
    });

    const userRecord = await admin.auth().getUser(uid);
    const existingClaims = userRecord.customClaims || {};
    const existingRoles = existingClaims.roles || [];

    if (!existingRoles.includes("seller")) {
      existingRoles.push("seller");

      await admin.auth().setCustomUserClaims(uid, {
        ...existingClaims,
        roles: existingRoles,
      });
    }

    await userRef.update({
      roles: FieldValue.arrayUnion("seller"),
    });
  } catch (err) {
    console.error("Error Approving KYC", err.message);
  }
});

exports.reapplySeller = functions.https.onCall(async (data, context) => {
  const { sid } = data;

  try {
    const sellerref = db.collection("sellers").doc(sid);
    await sellerref.update({
      sellerStatus: "DRAFT",
      rejectReason: null,
    });
  } catch (err) {
    console.error("Error reapplying seller", err.message);
  }
});

exports.reapplyKYC = functions.https.onCall(async (data, context) => {
  const { sid } = data;

  try {
    const sellerRef = db.collection("sellers").doc(sid);
    const kycRef = sellerRef.collection("kyc").doc(sid);

    await sellerRef.update({
      kycStatus: "NOT_SUBMITTED",
    });

    await kycRef.update({
      kycStatus: "NOT_SUBMITTED",
      rejectReason: null,
    });
  } catch (err) {}
});

exports.createNewProduct = functions.https.onCall(async (data, context) => {
  try {
    const { createProductFor, ...productData } = data;
    const uid = context.auth.uid;
    let sellerId = "ventureframe";
    const userRef = db.collection("users").doc(context.auth.uid);
    const userSnap = await userRef.get();

    if (createProductFor === "seller" && userSnap.exists) {
      sellerId = userSnap.data().sellerId;
    }

    let storeName = "VentureFrame";

    if (sellerId != "ventureframe") {
      const sellerRef = db.collection("sellers").doc(sellerId);
      const sellerSnap = await sellerRef.get();

      if (sellerSnap.exists) {
        storeName = sellerSnap.data().storeName;
      }
    }

    const productRef = db.collection("products").doc();
    const productId = productRef.id;
    const stockStatus = productData.stock > 0 ? "In Stock" : "Out of Stock";

    const priceWithDiscount = Math.ceil(
      productData.originalPrice -
        (productData.originalPrice * productData.discount) / 100,
    );

    await productRef.set({
      productId,
      createdBy: uid,
      sellerId,
      storeName,
      stockStatus,
      price: priceWithDiscount,
      ...productData,
    });

    console.log("Product created in Firestore:", productId);
    return productId;
  } catch (err) {
    console.error("Product creating error", err.message);
  }
});

exports.updateProduct = functions.https.onCall(async (data, context) => {
  try {
    // update firestore
    const { productId, updatedData } = data;

    if (Object.keys(updatedData).length <= 0) return; // return if no changes

    const productRef = db.collection("products").doc(productId);
    const productSnap = await productRef.get();
    const originalData = productSnap.data();

    const updatePayload = { ...updatedData };

    if (updatedData.stock !== undefined) {
      updatePayload.stockStatus =
        updatedData.stock > 0 ? "In Stock" : "Out of Stock";
    }

    if (
      updatedData.originalPrice !== undefined ||
      updatedData.discount !== undefined
    ) {
      const originalPrice =
        updatedData.originalPrice ?? originalData.originalPrice;
      const discount = updatedData.discount ?? originalData.discount;

      const priceWithDiscount = Math.ceil(
        originalPrice - (originalPrice * discount) / 100,
      );

      updatePayload.price = priceWithDiscount;
    }

    await productRef.update(updatePayload);

    // remove extra images // update storage
    const originalImages = originalData.images || [];

    if (updatedData.images !== undefined) {
      const updatedImages = updatedData.images || [];

      const removedImages = originalImages.filter(
        (originalImg) =>
          !updatedImages.some(
            (updatedImg) => updatedImg.path === originalImg.path,
          ),
      );

      await Promise.all(
        removedImages.map((img) => storage.bucket().file(img.path).delete()),
      );
    }
  } catch (err) {
    console.error("Error updating the product", err.message);
  }
});

exports.deleteProduct = functions.https.onCall(async (data, context) => {
  try {
    const { productId } = data;
    const productRef = db.collection("products").doc(productId);
    const productSnap = await productRef.get();
    const productImages = productSnap.data().images || [];

    await Promise.all(
      productImages.map((img) => storage.bucket().file(img.path).delete()),
    );

    await productRef.delete();
  } catch (err) {
    console.error("Error deleting the product", err.message);
  }
});

exports.createCategory = functions.https.onCall(async (data, context) => {
  try {
    const category = data.categoryName.trim().toLowerCase();

    const categoryRef = db
      .collection("storeConfig")
      .doc("metadata")
      .collection("categories")
      .doc(category);

    const existingSnap = await categoryRef.get();

    if (existingSnap.exists) {
      return existingSnap.id;
    } else {
      await categoryRef.set({
        category: category,
        icon: null,
      });

      return categoryRef.id;
    }
  } catch (err) {
    console.error("Error creating category", err.message);
  }
});

exports.deleteCategory = functions.https.onCall(async (data, context) => {
  try {
    const { categoryId } = data;
    const iconRef = storage
      .bucket()
      .file(`storeConfig/categories/${categoryId}/catIcon.jpg`);

    await iconRef.delete();

    const categoryRef = db
      .collection("storeConfig")
      .doc("metadata")
      .collection("categories")
      .doc(categoryId);
    await categoryRef.delete();
  } catch (err) {
    console.error("Error deleting the category", err.message);
  }
});

exports.createBanner = functions.https.onCall(async (data, context) => {
  try {
    const redirectTo = data.redirectTo.trim().toLowerCase();

    const bannersRef = db.collection("storeConfig/metadata/banners");
    const bannersSnap = await bannersRef.get();

    const getAvailableBannerSlot = () => {
      const banners = bannersSnap.docs.map((doc) => ({
        idNum: parseInt(doc.id.replace("banner_", ""), 10),
        banner: doc.data().banner,
      }));

      // Try to reuse empty slot
      const emptyBanner = banners
        .filter((b) => !b.banner)
        .sort((a, b) => a.idNum - b.idNum)[0];

      if (emptyBanner) {
        return {
          slotNum: emptyBanner.idNum,
          bannerId: `banner_${emptyBanner.idNum}`,
        };
      }

      // Otherwise create next number
      const maxId = banners.length
        ? Math.max(...banners.map((b) => b.idNum))
        : 0;

      const nextNumber = maxId + 1;

      return {
        slotNum: nextNumber,
        bannerId: `banner_${nextNumber}`,
      };
    };

    const { bannerId } = getAvailableBannerSlot();
    const bannerRef = bannersRef.doc(bannerId);

    await bannerRef.set({
      banner: null,
      redirectTo: redirectTo,
    });

    return bannerId;
  } catch (err) {
    console.error("Error creating a banner", err.message);
  }
});

exports.deleteBanner = functions.https.onCall(async (data, context) => {
  try {
    const { bannerId } = data;

    const imageRef = storage
      .bucket()
      .file(`storeConfig/banners/${bannerId}/banImage.jpg`);

    await imageRef.delete();

    const bannerRef = db.doc(`storeConfig/metadata/banners/${bannerId}`);
    await bannerRef.delete();
  } catch (err) {
    console.log("Error deleting a banner", err.message);
  }
});

exports.saveSection = functions.https.onCall(async (data, context) => {
  const { section } = data;

  const sectionsCollection = db
    .collection("storeConfig")
    .doc("metadata")
    .collection("sections");

  if (section.slug) {
    const sectionRef = sectionsCollection.doc(section.slug);
    await sectionRef.update({
      productIds: section.productIds ?? [],
      lockedBy: null,
      lockedAt: null,
    });
  } else {
    const createSlug = (text) => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // remove special characters
        .replace(/\s+/g, "-") // replace spaces with -
        .replace(/-+/g, "-"); // remove duplicate -
    };

    const slug = createSlug(section.title);
    const sectionRef = sectionsCollection.doc(slug);

    const existingDoc = await sectionRef.get();

    if (existingDoc.exists) {
      throw new functions.https.HttpsError(
        "already-exists",
        "Section already exists",
      );
    }

    await sectionRef.set(
      {
        title: section.title,
        slug,
        type: section.type,
        productIds: section.productIds ?? [],
        lockedBy: null,
        lockedAt: null,
      },
      { merge: true },
    );
  }
});

exports.deleteSection = functions.https.onCall(async (data, context) => {
  const { sectionId } = data;

  const sectionRef = db
    .collection("storeConfig")
    .doc("metadata")
    .collection("sections")
    .doc(sectionId);

  await sectionRef.delete();
});

exports.lockSection = functions.https.onCall(async (data, context) => {
  try {
    const { secId } = data;
    const uid = context.auth?.uid;

    const sectionRef = db
      .collection("storeConfig")
      .doc("metadata")
      .collection("sections")
      .doc(secId);

    await sectionRef.update({
      lockedBy: uid,
      lockedAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error(err.message);
  }
});

exports.unlockSection = functions.https.onCall(async (data, context) => {
  try {
    const { secId } = data;
    const uid = context.auth?.uid;
    const LOCK_TIMEOUT_MS = 30 * 1000; // 15 minutes

    const sectionRef = db
      .collection("storeConfig")
      .doc("metadata")
      .collection("sections")
      .doc(secId);

    const sectionSnap = await sectionRef.get();
    const sectionData = sectionSnap.data();

    const nowMillis = Timestamp.now().toMillis();
    const lockedAtMillis = sectionData.lockedAt
      ? sectionData.lockedAt.toMillis()
      : 0;

    const isExpired = nowMillis - lockedAtMillis > LOCK_TIMEOUT_MS + 2000; // buffer

    if (!isExpired && sectionData.lockedBy !== uid) {
      return;
    }

    await sectionRef.update({
      lockedBy: null,
      lockedAt: null,
    });
  } catch (err) {
    console.error(err.message);
  }
});

// Testing
exports.seedTestProducts = functions.https.onCall(async (data, context) => {
  try {
    const { count = 20 } = data;

    const categories = ["electronics", "clothing", "mobiles"];
    const brands = ["Sony", "Nike", "Apple", "Samsung", "Adidas"];
    const features = [
      "Premium Quality",
      "1 Year Warranty",
      "Best Seller",
      "Limited Edition",
    ];

    const batch = db.batch();

    for (let i = 0; i < count; i++) {
      const productRef = db.collection("products").doc();
      const productId = productRef.id;

      const originalPrice = Math.floor(Math.random() * 5000) + 500;
      const discount = Math.floor(Math.random() * 40);
      const stock = Math.floor(Math.random() * 50);

      const priceWithDiscount = Math.ceil(
        originalPrice - (originalPrice * discount) / 100,
      );

      const productData = {
        productId,
        createdBy: "ventureFrame",
        sellerId: "ventureframe",
        storeName: "VentureFrame",
        stockStatus: stock > 0 ? "In Stock" : "Out of Stock",
        price: priceWithDiscount,
        originalPrice,
        discount,
        stock,
        title: `Test Product ${i + 1}`,
        brand: brands[Math.floor(Math.random() * brands.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        description: "This is a test product generated for development.",
        features: [features[Math.floor(Math.random() * features.length)]],
        options: [],
        specs: [],
        images: [
          {
            url: `https://picsum.photos/400?random=${i}`,
            path: null,
          },
        ],
        createdAt: FieldValue.serverTimestamp(),
      };

      batch.set(productRef, productData);
    }

    await batch.commit();
  } catch (err) {
    console.error(err);
  }
});
