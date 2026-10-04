const fileUpload = require("express-fileupload");
const path = require("path");

const conditionalFileUpload = (options = {}) => {
  const upload = fileUpload(options);

  return (req, res, next) => {
    // ⚠️ ONLY multer routes here. /api/profile uses express-fileupload.
    const multerRoutes = [
      "/api/projects",
      "/api/formations",
      "/api/certificates",
    ];

    const useMulter = multerRoutes.some((route) => req.path.startsWith(route));

    if (useMulter) {
      console.log(`Using multer for ${req.path} - skipping express-fileupload`);
      return next();
    }

    upload(req, res, next);
  };
};

module.exports = conditionalFileUpload;
