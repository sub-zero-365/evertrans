const isProduction = process.env.NODE_ENV == "production"
// this set cookies to the browser when depending on the environment varaible

  const cookies = (time) => {
    const obj = {
      httpOnly: isProduction,
      expires: time ? new Date(Date.now() + time) : new Date(Date.now()),
      secure: isProduction,
    };
    if (isProduction) obj.sameSite = "none";
  
    return {
      ...obj,
    };
  };
  
module.exports=cookies
