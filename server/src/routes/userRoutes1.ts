import { Router } from "express";
import { registerUser1, loginUser1, forgotPassword1, verifyUserRegistration, userResetPassword, updateUserEmail, updateUserUsername, logoutUser } from "../controllers/userController1";
// import { auth } from "../middlewares/auth";

const router = Router();

router.post("/registerUser1", registerUser1);
router.post("/loginUser1", loginUser1);
router.post("/forgotPassword1", forgotPassword1);
router.post("/verifyUser1", verifyUserRegistration);
router.post("/resetPassword1", userResetPassword);
router.put("/updateEmail", updateUserEmail);
router.put("/updateUsername", updateUserUsername);
router.post("/logoutUser", logoutUser)

export default router;
