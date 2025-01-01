const isProduction = process.env.NODE_ENV == "production"
// this set cookies to the browser when depending on the environment varaible

const cookies = (time = null) => {
  const obj = {
      httpOnly: true, // Prevents client-side access to the cookie
      secure: isProduction, // Ensures cookies are sent only over HTTPS in production
      sameSite: isProduction?'None':"lax",  // Allows the cookie to be sent across subdomains
      expires: time ? new Date(Date.now() + time) : new Date(0), // Sets expiry time or invalidates the cookie
  };

  return { ...obj };
};

  
module.exports=cookies
