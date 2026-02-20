import {
  doc,
  getDoc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Validate a coupon for a given user.
 * Returns { valid, coupon, error }.
 */
export async function validateCoupon(couponCode, uid) {
  const code = couponCode.trim().toUpperCase();
  const q = query(collection(db, 'coupons'), where('code', '==', code), where('active', '==', true));
  const snap = await getDocs(q);

  if (snap.empty) {
    return { valid: false, coupon: null, error: 'Cupom não encontrado.' };
  }

  const couponDoc = snap.docs[0];
  const coupon = { id: couponDoc.id, ...couponDoc.data() };

  // Check restricted
  if (coupon.restrictedToUid && coupon.restrictedToUid !== uid) {
    return { valid: false, coupon: null, error: 'Este cupom não é válido para você.' };
  }

  // Check dates
  const now = new Date();
  if (coupon.validFrom) {
    const from = coupon.validFrom.toDate ? coupon.validFrom.toDate() : new Date(coupon.validFrom);
    if (now < from) {
      return { valid: false, coupon: null, error: 'Cupom ainda não está ativo.' };
    }
  }
  if (coupon.validUntil) {
    const until = coupon.validUntil.toDate ? coupon.validUntil.toDate() : new Date(coupon.validUntil);
    if (now > until) {
      return { valid: false, coupon: null, error: 'Cupom expirado.' };
    }
  }

  // Check total uses
  if (coupon.maxTotalUses != null && (coupon.totalUsed || 0) >= coupon.maxTotalUses) {
    return { valid: false, coupon: null, error: 'Cupom esgotado.' };
  }

  // Check per-user uses
  const redemptionId = `${coupon.id}_${uid}`;
  const redemptionDoc = await getDoc(doc(db, 'couponRedemptions', redemptionId));
  const usedCount = redemptionDoc.exists() ? redemptionDoc.data().usedCount || 0 : 0;
  if (usedCount >= coupon.maxUsesPerUser) {
    return { valid: false, coupon: null, error: 'Você já usou este cupom o máximo permitido.' };
  }

  return { valid: true, coupon, error: null };
}

/**
 * Consume (redeem) a coupon using a Firestore transaction.
 * This ensures atomicity: validates + increments in one go.
 * Returns { success, error }.
 */
export async function redeemCoupon(couponId, uid) {
  try {
    await runTransaction(db, async (transaction) => {
      const couponRef = doc(db, 'coupons', couponId);
      const couponSnap = await transaction.get(couponRef);

      if (!couponSnap.exists()) throw new Error('Cupom não encontrado.');
      const coupon = couponSnap.data();

      if (!coupon.active) throw new Error('Cupom desativado.');

      // Date checks
      const now = new Date();
      if (coupon.validFrom) {
        const from = coupon.validFrom.toDate ? coupon.validFrom.toDate() : new Date(coupon.validFrom);
        if (now < from) throw new Error('Cupom ainda não está ativo.');
      }
      if (coupon.validUntil) {
        const until = coupon.validUntil.toDate ? coupon.validUntil.toDate() : new Date(coupon.validUntil);
        if (now > until) throw new Error('Cupom expirado.');
      }

      // Total uses
      if (coupon.maxTotalUses != null && (coupon.totalUsed || 0) >= coupon.maxTotalUses) {
        throw new Error('Cupom esgotado.');
      }

      // Per-user
      const redemptionId = `${couponId}_${uid}`;
      const redemptionRef = doc(db, 'couponRedemptions', redemptionId);
      const redemptionSnap = await transaction.get(redemptionRef);
      const usedCount = redemptionSnap.exists() ? redemptionSnap.data().usedCount || 0 : 0;

      if (usedCount >= coupon.maxUsesPerUser) {
        throw new Error('Limite de uso do cupom atingido.');
      }

      // Increment totalUsed
      transaction.update(couponRef, {
        totalUsed: (coupon.totalUsed || 0) + 1,
      });

      // Increment user redemption
      if (redemptionSnap.exists()) {
        transaction.update(redemptionRef, {
          usedCount: usedCount + 1,
          lastUsedAt: Timestamp.now(),
        });
      } else {
        transaction.set(redemptionRef, {
          couponId,
          uid,
          usedCount: 1,
          lastUsedAt: Timestamp.now(),
        });
      }
    });

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message || 'Erro ao aplicar cupom.' };
  }
}

/**
 * Fetch exclusive coupons for a user (restrictedToUid == uid).
 */
export async function fetchMyCoupons(uid) {
  const q = query(
    collection(db, 'coupons'),
    where('restrictedToUid', '==', uid),
    where('active', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
