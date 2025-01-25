const validateFields = ({email,name,pincode,phone}) => {
  const errors = {};
  console.log(email)
  if (!email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.email = "Invalid email format";
  }

  // if (!name) errors.name = "Name is required";

  if (phone && !phone.match(/^\d{10}$/)) {
    errors.phone = "Invalid phone number format";
  }
  if (pincode && !String(pincode).match(/^\d{6}$/)) {
    errors.pincode = "Invalid PIN code format";
  }
  console.log(errors)
  return errors;
};


export { validateFields };
