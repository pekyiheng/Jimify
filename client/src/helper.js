function formatDateToYYYYMMDD(date) {
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error("Invalid Date object provided.");
    }
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 because months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
}

export { formatDateToYYYYMMDD };