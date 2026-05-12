export const formatDate = (date: string) => {
  const dateObj = new Date(date);

  const formattedDate = dateObj.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
  });

  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedTime}, ${formattedDate}`;
};
