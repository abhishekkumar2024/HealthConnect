const isValidPhoneOrEmail = (value) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;
  
    if (value.length === 0) {
      return { isValid: false, error: "Input cannot be empty." };
    } else if (emailPattern.test(value)) {
      return { isValid: true, error: "" }; // Valid email
    } else if (phonePattern.test(value)) {
      return { isValid: true, error: "" }; // Valid phone
    } else {
      return { isValid: false, error: "Invalid Phone or Email ID." };
    }
  };
  
  export { isValidPhoneOrEmail };
  