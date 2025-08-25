export enum OrderStatus {
  // 초기상태
  PAID = '결제 완료',

  // 배송 준비 및 진행 상태
  SHIPPING = '배송중',
  DELIVERED = '배송 완료',

  // 취소 및 환불 상태
  CANCELED = '주문 취소',
  REFUNDED = '환불 완료',
}
