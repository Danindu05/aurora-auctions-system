export const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
  }).format(Number(value));
};

export const formatDate = (isoString) => {
  if (!isoString) return "-";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
};
