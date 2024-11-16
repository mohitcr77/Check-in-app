export const checkIsEmpty = (value, valueName) => {
    if (!value) {
        const error = new Error(`Enter a value for ${valueName}`);
        error.response = { data: { msg: `Enter a value for ${valueName}` } };
        throw error;
    }
    return;
}

export const checkValidPassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!password) {
        const error = new Error("Password cannot be empty");
        error.response = { data: { msg: "Password cannot be empty" } };
        throw error;
    }

    if (password.length < minLength) {
        const error = new Error(`Password must be at least ${minLength} characters long`);
        error.response = { data: { msg: `Password must be at least ${minLength} characters long` } };
        throw error;
    }

    if (!hasUpperCase) {
        const error = new Error("Password must contain at least one uppercase letter");
        error.response = { data: { msg: "Password must contain at least one uppercase letter" } };
        throw error;
    }

    if (!hasLowerCase) {
        const error = new Error("Password must contain at least one lowercase letter");
        error.response = { data: { msg: "Password must contain at least one lowercase letter" } };
        throw error;
    }

    if (!hasNumber) {
        const error = new Error("Password must contain at least one number");
        error.response = { data: { msg: "Password must contain at least one number" } };
        throw error;
    }

    if (!hasSpecialChar) {
        const error = new Error("Password must contain at least one special character");
        error.response = { data: { msg: "Password must contain at least one special character" } };
        throw error;
    }

    return;
};