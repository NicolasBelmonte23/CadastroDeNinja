import { Linking } from 'react-native';
import { WHATSAPP_NUMBER, PIX_KEY_CPF, APP_NAME } from '../config/constants';
import { formatBRL, formatPhone } from './format';

/**
 * Build the WhatsApp order message.
 */
export function buildOrderMessage({
  customerName,
  customerPhone,
  address,
  items,
  subtotalCents,
  coupon,
  discountCents,
  totalCents,
  paymentMethod,
  observations,
}) {
  const lines = [];
  lines.push(`*Pedido – ${APP_NAME}*`);
  lines.push('');
  lines.push(`*Cliente:* ${customerName}`);
  lines.push(`*Celular:* ${formatPhone(customerPhone)}`);

  const addr = [
    address.street,
    address.number,
    address.neighborhood,
    address.complement,
    address.city,
  ]
    .filter(Boolean)
    .join(', ');
  lines.push(`*Endereço:* ${addr}`);
  lines.push('');

  lines.push('*Itens:*');
  items.forEach((item) => {
    const itemSubtotal = item.priceCents * item.qty;
    lines.push(`- ${item.qty}x ${item.name} — ${formatBRL(itemSubtotal)}`);
  });
  lines.push('');

  lines.push(`*Subtotal:* ${formatBRL(subtotalCents)}`);

  if (coupon && discountCents > 0) {
    lines.push(`*Cupom:* ${coupon.code} (-${formatBRL(discountCents)})`);
  }

  lines.push(`*Total:* ${formatBRL(totalCents)}`);
  lines.push('');

  if (paymentMethod === 'pix') {
    lines.push('*Pagamento:* Pix (online)');
    lines.push(`*Chave Pix (CPF):* ${PIX_KEY_CPF}`);
    lines.push('Envie o comprovante aqui no WhatsApp.');
  } else if (paymentMethod === 'dinheiro') {
    lines.push('*Pagamento:* Dinheiro na entrega');
  } else if (paymentMethod === 'cartao') {
    lines.push('*Pagamento:* Cartão na entrega');
  }

  if (observations) {
    lines.push('');
    lines.push(`*Observações:* ${observations}`);
  }

  return lines.join('\n');
}

/**
 * Open WhatsApp click-to-chat with the order message.
 */
export async function sendOrderViaWhatsApp(orderData) {
  const message = buildOrderMessage(orderData);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
    return true;
  }
  return false;
}
