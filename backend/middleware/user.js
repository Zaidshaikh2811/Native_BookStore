export const userLogin = (req, res) => {
    try {
        console.log("User login attempt");
        console.log("Request body:", req.body);

        return res.status(200).json({
            status: "success",
            message: "Login successful"
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            status: "error",
            message: error.message || "Login failed"
        });
    }
};

export const userSignup = (req, res) => {
    try {
        console.log("User signup attempt");
        console.log("Request body:", req.body);

        return res.status(200).json({
            status: "success",
            message: "Signup successful"
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            status: "error",
            message: error.message || "Signup failed"
        });
    }
};