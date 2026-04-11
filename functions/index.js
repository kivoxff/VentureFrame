const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const { algoliasearch } = require("algoliasearch");
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

exports.createCoupon = functions.https.onCall(async (data, context) => {
  const { code, type, value, minOrder, usageLimit, expiry } = data;

  if (!code || !value) {
    throw new functions.https.HttpsError("invalid-argument", "Missing fields");
  }

  if (!["PERCENT", "FLAT"].includes(type)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid type");
  }

  if (type === "PERCENT" && value > 100) {
    throw new functions.https.HttpsError("invalid-argument", "Max 100%");
  }

  const couponRef = db.collection("coupons").doc(code);

  const existing = await couponRef.get();
  if (existing.exists) {
    throw new functions.https.HttpsError("already-exists", "Coupon exists");
  }

  await couponRef.set({
    code,
    type,
    value: Number(value),
    minOrder: Number(minOrder) || 0,
    usageLimit: Number(usageLimit) || null,
    usedCount: 0,
    expiry: expiry ? Timestamp.fromDate(new Date(expiry)) : null,
    isActive: true,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
});

exports.deleteCoupon = functions.https.onCall(async (data, context) => {
  const { code } = data;

  const couponRef = db.collection("coupons").doc(code);
  const snap = await couponRef.get();

  if (!snap.exists) {
    throw new functions.https.HttpsError("not-found", "Coupon not found");
  }

  await couponRef.delete();

  return { success: true };
});

exports.validateCoupon = functions.https.onCall(async (data, context) => {
  const uid = context.auth.uid;

  const { code, subTotal } = data;

  if (!code || subTotal === undefined) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing code or sub total.",
    );
  }

  const couponRef = db.collection("coupons").doc(code);
  const snap = await couponRef.get();

  if (!snap.exists) {
    throw new functions.https.HttpsError("not-found", "Invalid coupon code.");
  }

  const coupon = snap.data();

  if (!coupon.isActive) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "This coupon is no longer active.",
    );
  }

  // Check expiration date
  if (coupon.expiry) {
    const now = new Date();
    const expiryDate = coupon.expiry.toDate(); // Convert Firestore Timestamp to JS Date
    if (now > expiryDate) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "This coupon has expired.",
      );
    }
  }

  if (coupon.usedBy && coupon.usedBy[uid]) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "You have already used this coupon",
    );
  }

  // Check minimum order amount
  if (coupon.minOrder && subTotal < coupon.minOrder) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      `Your cart total must be at least ₹${coupon.minOrder} to use this coupon.`,
    );
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "This coupon has reached its usage limit.",
    );
  }

  // --- Calculate the actual discount ---
  let discountAmount = 0;
  if (coupon.type === "PERCENT") {
    discountAmount = (subTotal * coupon.value) / 100;
  } else if (coupon.type === "FLAT") {
    discountAmount = coupon.value;
  }

  // Prevent the discount from making the order total negative
  discountAmount = Math.min(discountAmount, subTotal);

  return {
    success: true,
    discountAmount: Number(discountAmount.toFixed(2)),
  };
});

exports.createOrder = functions.https.onCall(async (data, context) => {
  // INPUT VALIDATION & SETUP
  const uid = context.auth.uid;
  const { products, paymentMethod = "ONLINE", couponCode } = data; // Expect "COD" or "ONLINE"

  if (!products || !products.length) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "No Products Provided",
    );
  }
  if (!["COD", "ONLINE"].includes(paymentMethod)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid Payment Method",
    );
  }

  const EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
  const now = Timestamp.now();

  const transactionResult = await db.runTransaction(async (tx) => {
    // Pre-generate the Order ID so we can use it as our unique reservation key
    const orderRef = db.collection("orders").doc();
    const orderId = orderRef.id;

    // Prepare references
    const productRefs = products.map((p) => db.doc(`products/${p.id}`));
    const resProductRefs = products.map((p) =>
      db.doc(`reservedProducts/${p.id}`),
    );

    const couponRef = couponCode
      ? db.collection("coupons").doc(couponCode)
      : null;
    const resCouponRef = couponCode
      ? db.collection("reservedCoupons").doc(couponCode)
      : null;

    // Fetch products and coupons
    const proCombinedSnap =
      (await tx.getAll(...productRefs, ...resProductRefs)) || [];
    const productSnaps = proCombinedSnap.slice(0, products.length);
    const resProductSnaps = proCombinedSnap.slice(products.length);

    const [couponSnap, resCouponSnap] = couponCode
      ? await tx.getAll(couponRef, resCouponRef)
      : []; // coupCombinedSnap | couponSnap | reCouponSnap

    // Process each product
    const processedProducts = products.map((requestedProduct, index) => {
      const { id, qty } = requestedProduct;
      const productSnap = productSnaps[index];
      const resProductSnap = resProductSnaps[index];

      if (!productSnap.exists) {
        throw new functions.https.HttpsError("not-found", `${id} not found`);
      }

      const productData = productSnap.data();
      const resProductData = resProductSnap.exists ? resProductSnap.data() : {};

      const actualStock = productData.stock;

      // Compute valid reservations and total reserved quantity in one pass
      const { validProdRes, reservedStock } = Object.entries(
        resProductData,
      ).reduce(
        (accumulator, [resId, reservation]) => {
          const isExpired = reservation.expiresAt.toMillis() < now.toMillis();

          if (!isExpired) {
            accumulator.validProdRes[resId] = reservation;
            accumulator.reservedStock += reservation.quantity;
          }

          return accumulator;
        },
        { validProdRes: {}, reservedStock: 0 },
      );

      // final stock
      const availableStock = actualStock - reservedStock;

      if (qty > availableStock) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `${id} out of stock. Only ${availableStock} available.`,
        );
      }

      const { title: name, price } = productData;

      return {
        id,
        name,
        price,
        qty,
        actualStock,
        validProdRes,
        productRef: productRefs[index],
        resProductRef: resProductRefs[index],
      };
    });

    const orderItems = processedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      quantity: p.qty,
      price: p.price,
    }));

    const subTotal = processedProducts.reduce(
      (sum, p) => sum + p.price * p.qty,
      0,
    );

    let discountAmount = 0;

    // Process Coupon
    if (couponCode && couponSnap && couponSnap.exists) {
      const couponData = couponSnap.data();

      if (!couponData.isActive) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Coupon is not active.",
        );
      }

      if (couponData.expiryDate) {
        const isExpired = now.toMillis() > couponData.expiryDate.toMillis();

        if (isExpired) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "Coupon expired.",
          );
        }
      }

      if (couponData.usedBy && couponData.usedBy[uid]) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "You have already used this coupon",
        );
      }

      if (subTotal < couponData.minOrder) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Order total must be at least ₹${couponData.minOrder} to use this coupon.`,
        );
      }

      // Clean up expired coupon reservations
      const resCouponData = resCouponSnap.exists ? resCouponSnap.data() : {};

      const { validCouponRes, resCouponCount } = Object.entries(
        resCouponData,
      ).reduce(
        (accumulator, [resId, reservation]) => {
          const isExpired = reservation.expiresAt.toMillis() < now.toMillis();
          if (!isExpired) {
            accumulator.validCouponRes[resId] = reservation;
            accumulator.resCouponCount += 1;
          }

          return accumulator;
        },
        { validCouponRes: {}, resCouponCount: 0 },
      );

      // Check usage limit (only if limit exists)
      if (couponData.usageLimit != null) {
        const used = (couponData.usedCount || 0) + resCouponCount;

        if (used >= couponData.usageLimit) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "Coupon usage limit reached.",
          );
        }
      }

      // Calculate Discount
      const couponAmount =
        couponData.type === "PERCENT"
          ? (subTotal * couponData.value) / 100
          : couponData.value;

      // Ensure we don't discount more than the subtotal itself
      discountAmount = Math.min(couponAmount, subTotal);

      // Write Coupon Data
      if (paymentMethod === "COD") {
        // Increment usage immediately
        tx.update(couponSnap.ref, {
          usedCount: FieldValue.increment(1),
          [`usedBy.${uid}`]: true,
        });
        tx.set(resCouponRef, validCouponRes);
      } else {
        // Reserve for Online Payment
        validCouponRes[orderId] = {
          uid,
          reservedAt: now,
          expiresAt: Timestamp.fromMillis(now.toMillis() + EXPIRY_TIME),
        };
        tx.set(resCouponRef, validCouponRes);
      }
    }

    const finalAmount = subTotal - discountAmount;

    // Write product & stock data
    processedProducts.forEach((p) => {
      if (paymentMethod === "COD") {
        // Deduct actual stock immediately, update cleaned reservations
        tx.update(p.productRef, { stock: p.actualStock - p.qty });
        tx.set(p.resProductRef, p.validProdRes);
      } else {
        // Add the new reservation
        p.validProdRes[orderId] = {
          uid,
          quantity: p.qty,
          reservedAt: now,
          expiresAt: Timestamp.fromMillis(now.toMillis() + EXPIRY_TIME),
        };

        tx.set(p.resProductRef, p.validProdRes);
      }
    });

    // Create the final order document
    const initialStatus =
      paymentMethod === "COD" ? "PROCESSING" : "PENDING_PAYMENT";

    tx.set(orderRef, {
      userId: uid,
      items: orderItems,
      paymentMethod: paymentMethod,
      status: initialStatus,
      couponCode: couponCode || null,
      discountAmount,
      totalAmount: finalAmount,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { orderId: orderId, status: initialStatus, orderItems, finalAmount };
  });

  // STRIPE Checkout session
  if (paymentMethod === "ONLINE") {
    try {
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

      //  Create the PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(transactionResult.finalAmount * 100), // Convert INR to Paise
        currency: "inr",
        // Keep metadata so the Webhook still knows which order to fulfill!
        metadata: {
          orderId: transactionResult.orderId,
          uid: uid,
        },
      });

      // Return the client_secret to the frontend!
      return {
        orderId: transactionResult.orderId,
        status: transactionResult.status,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (err) {
      console.error("Stripe Error:", err);
      throw new functions.https.HttpsError(
        "internal",
        "Payment session failed.",
      );
    }
  } else {
    // COD
    return {
      orderId: transactionResult.orderId,
      status: transactionResult.status,
    };
  }
});

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  // Verify the webhook is from stripe
  let event;
  try {
    const signature = req.headers["stripe-signature"];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    event = stripe.webhooks.constructEvent(req.rawBody, signature, secret);
  } catch (err) {
    console.error("Verification failed: ", err.message);
    return res.status(400).send("Webhook Error: Invalid Signature");
  }

  // Extract order details
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata?.orderId;
  const uid = paymentIntent.metadata?.uid;

  // If there is no order ID, this payment isn't related to our store.
  if (!orderId) {
    return res.status(200).send("No order ID found");
  }

  const orderRef = db.collection("orders").doc(orderId);

  try {
    await db.runTransaction(async (tx) => {
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) return;

      const order = orderSnap.data();

      if (order.status !== "PENDING_PAYMENT" && order.status !== "FAILED")
        return;

      // On success
      if (event.type === "payment_intent.succeeded") {
        // Mark order paid
        tx.update(orderRef, { status: "PROCESSING" });

        // Process each item in the order
        for (const item of order.items) {
          const productRef = db.collection("products").doc(item.id);
          const resProductRef = db.collection("reservedProducts").doc(item.id);

          // Permanently deduct the stock
          tx.update(productRef, {
            stock: FieldValue.increment(-item.quantity),
          });

          // Delete the reserved data
          tx.update(resProductRef, {
            [orderId]: FieldValue.delete(),
          });
        }

        const coupon = order.couponCode || null;

        if (coupon) {
          const couponRef = db.collection("coupons").doc(coupon);
          const resCouponRef = db.collection("reservedCoupons").doc(coupon);

          // Tally up the coupon usage and log the user ID
          tx.update(couponRef, {
            usedCount: FieldValue.increment(1),
            [`usedBy.${uid}`]: true,
          });

          // Remove the temporary hold on coupon
          tx.update(resCouponRef, {
            [orderId]: FieldValue.delete(),
          });

          console.log(`Order ${orderId} success!`);
        }
      }

      // On Failure
      if (
        event.type === "payment_intent.payment_failed" ||
        event.type === "payment_intent.canceled"
      ) {
        // Mark the order as failed
        tx.update(orderRef, { status: "FAILED" });

        // Release the temporary hold
        for (const item of order.items) {
          const resProductRef = db.collection("reservedProducts").doc(item.id);

          tx.update(resProductRef, {
            [orderId]: FieldValue.delete(),
          });
        }

        const coupon = order.couponCode || null;

        if (coupon) {
          const couponRef = db.collection("coupons").doc(coupon);
          const resCouponRef = db.collection("reservedCoupons").doc(coupon);

          tx.update(resCouponRef, {
            [orderId]: FieldValue.delete(),
          });
        }

        console.log(`Order ${orderId} failed.`);
      }
    });

    res.json({ received: true });
  } catch (err) {
    console.error("Error while processing order: ", err.message);
    res.status(500).send("Internal Server Error");
  }
});

exports.syncProducts = functions.firestore
  .document("products/{id}")
  .onWrite(async (change, context) => {
    const client = algoliasearch(
      process.env.ALGOLIA_APP_ID,
      process.env.ALGOLIA_WRITE_API_KEY
    );

    const productId = context.params.id;
    const indexName = process.env.ALGOLIA_INDEX; 

    // DELETE SCENARIO
    if (!change.after.exists) {
      await client.deleteObject({
        indexName: indexName,
        objectID: productId,
      });
      console.log(`Deleted ${productId} from Algolia`);
      return;
    }

    // === THE GUARD CLAUSE ===
    // If this is an UPDATE (both before and after exist), check if the data actually changed.
    if (change.before.exists && change.after.exists) {
      const beforeData = change.before.data();
      const afterData = change.after.data();

      // Convert to strings to quickly compare if the objects are identical
      if (JSON.stringify(beforeData) === JSON.stringify(afterData)) {
        console.log(`No changes detected for ${productId}. Skipping Algolia sync.`);
        return; // Exit the function early!
      }
    }

    // CREATE / UPDATE SCENARIO
    const data = change.after.data();

    await client.saveObject({
      indexName: indexName,
      body: {
        objectID: productId,
        ...data,
      },
    });
    console.log(`Saved ${productId} to Algolia`);
  });

  
// Testing
exports.seedTestProducts = functions.https.onCall(async (data, context) => {
  try {
    const { count = 5 } = data;

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
      };

      batch.set(productRef, productData);
    }

    await batch.commit();
  } catch (err) {
    console.error(err);
  }
});
