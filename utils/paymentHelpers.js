exports.getPaymentAmount = (subscription) => {
  const paymentMap = { "free trial": 0, basic: 100, premium: 200 };
  return paymentMap[subscription];
};

exports.getPaymentDatePaidAmount = (previousDate) => {
  previousDate.setDate(previousDate.getDate() + 30);
  return previousDate.toISOString();
};

exports.getPaymentDateUserCreated = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
};

exports.getPaymentDateSubscriptionChange = (user) => {
  const date = new Date();
  if (
    user.paymentDate.getMonth() + 1 == date.getMonth() + 1 &&
    user.subscription !== "free trial"
  ) {
    return null;
  }
  date.setDate(date.getDate() + 30);
  return date.toISOString();
};
