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

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "This coupon has reached its usage limit.",
    );
  }

  // Check minimum order amount
  if (coupon.minOrder && subTotal < coupon.minOrder) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      `Your cart total must be at least ₹${coupon.minOrder} to use this coupon.`,
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

  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  const EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

  const transactionResult = await db.runTransaction(async (tx) => {
    // Pre-generate the Order ID so we can use it as our unique reservation key
    const orderRef = db.collection("orders").doc();
    const orderId = orderRef.id;

    const productRefs = products.map((p) => db.doc(`products/${p.id}`));
    const reservedRefs = products.map((p) =>
      db.doc(`reservedProducts/${p.id}`),
    );

    const allSnaps = await tx.getAll(...productRefs, ...reservedRefs);
    const productSnaps = allSnaps.slice(0, products.length);
    const reservedSnaps = allSnaps.slice(products.length);

    const now = Timestamp.now();
    const productWrites = [];
    const reservedWrites = [];
    let orderItems = [];
    let subTotal = 0;

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const { id, qty } = products[i];
      const productSnap = productSnaps[i];
      const reservedSnap = reservedSnaps[i];

      if (!productSnap.exists) {
        throw new functions.https.HttpsError("not-found", `${id} not found`);
      }

      const productData = productSnap.data();
      const actualStock = productData.stock;

      subTotal += productData.price * qty;

      let reservedData = reservedSnap.exists ? reservedSnap.data() : {};
      let totalReservedStock = 0;

      // Clean up expired reservations (from ALL users/orders)
      for (const resOrderId in reservedData) {
        const reservation = reservedData[resOrderId];

        const isExpired =
          now.toMillis() - reservation.reservedAt.toMillis() > EXPIRY_TIME;

        if (isExpired) {
          delete reservedData[resOrderId];
        } else {
          totalReservedStock += reservation.quantity;
        }
      }

      // Calculate what is actually safe to sell right now
      const availableStock = actualStock - totalReservedStock;

      if (qty > availableStock) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `${id} out of stock. Only ${availableStock} available.`,
        );
      }

      // Branch logic based on Payment Method
      if (paymentMethod === "COD") {
        // COD: Deduct actual stock immediately
        productWrites.push({
          ref: productRefs[i],
          data: { stock: actualStock - qty }, // Subtract from actual stock
        });

        // We still need to write the cleaned-up reservations back to the DB
        reservedWrites.push({ ref: reservedRefs[i], data: reservedData });
      } else if (paymentMethod === "ONLINE") {
        // ONLINE: Add to reservations using the ORDER ID (prevents multi-order overwrite bugs)
        reservedData[orderId] = {
          uid: uid,
          quantity: qty,
          reservedAt: now,
        };

        reservedWrites.push({ ref: reservedRefs[i], data: reservedData });
      }

      orderItems.push({
        id,
        name: productData.title,
        quantity: qty,
        price: productData.price,
      });
    }

    // COUPON RESERVATION LOGIC

    // Prepare Coupon References if provided
    let couponSnap = null;
    let reservedCouponSnap = null;

    if (couponCode) {
      const couponRef = db.collection("coupons").doc(couponCode);
      const reservedCouponRef = db
        .collection("reservedCoupons")
        .doc(couponCode);

      // Fetch coupon data
      const couponSnaps = await tx.getAll(couponRef, reservedCouponRef);
      couponSnap = couponSnaps[0];
      reservedCouponSnap = couponSnaps[1];
    }

    let discountAmount = 0;

    if (couponCode && couponSnap && couponSnap.exists) {
      const couponData = couponSnap.data();

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

      // Clean up expired coupon reservations
      let reservedCouponData = reservedCouponSnap.exists
        ? reservedCouponSnap.data()
        : {};

      let reservedCouponCount = 0;

      for (const resOrderId in reservedCouponData) {
        const isExpired =
          now.toMillis() -
            reservedCouponData[resOrderId].reservedAt.toMillis() >
          EXPIRY_TIME;
        if (isExpired) {
          delete reservedCouponData[resOrderId];
        } else {
          reservedCouponCount++;
        }
      }

      // Check active status
      if (!couponData.isActive) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Coupon is not active.",
        );
      }

      // Check usage limit (only if limit exists)
      if (couponData.usageLimit != null) {
        const used = (couponData.usedCount || 0) + reservedCouponCount;

        if (used >= couponData.usageLimit) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            "Coupon usage limit reached.",
          );
        }
      }

      // Calculate Discount
      if (couponData.type === "PERCENT") {
        discountAmount = (subTotal * couponData.value) / 100;
      } else {
        discountAmount = couponData.value;
      }

      discountAmount = Math.min(discountAmount, subTotal);

      // Branch Coupon Write
      if (paymentMethod === "COD") {
        // Increment usage immediately
        tx.update(couponSnap.ref, {
          usedCount: FieldValue.increment(1),
          [`usedBy.${uid}`]: true,
        });
        tx.set(reservedCouponSnap.ref, reservedCouponData);
      } else {
        // Reserve for Online Payment
        reservedCouponData[orderId] = {
          uid: uid,
          reservedAt: now,
        };
        tx.set(reservedCouponSnap.ref, reservedCouponData);
      }
    }

    const finalAmount = subTotal - discountAmount;

    // Apply all writes safely within the transaction
    for (const write of productWrites) {
      tx.update(write.ref, write.data);
    }
    for (const write of reservedWrites) {
      tx.set(write.ref, write.data);
    }

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
      // 2. Create the PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(transactionResult.finalAmount * 100), // Convert INR to Paise
        currency: "inr",
        // Keep metadata so the Webhook still knows which order to fulfill!
        metadata: {
          orderId: transactionResult.orderId,
          uid: uid,
        },
      });

      // 3. Return the client_secret to the frontend!
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
      };

      batch.set(productRef, productData);
    }

    await batch.commit();
  } catch (err) {
    console.error(err);
  }
});
