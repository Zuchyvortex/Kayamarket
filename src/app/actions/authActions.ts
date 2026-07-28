"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function registerUser(formData: FormData) {
  try {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    if (!firstName || !lastName || !email || !password) {
      return { success: false, error: "Missing required fields" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: "Email is already registered" };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phoneNumber: phone || null,
        passwordHash,
        role: "CUSTOMER",
      },
    });

    // Notify Admin of new customer registration
    await prisma.notification.create({
      data: {
        targetRole: "ADMIN",
        title: "New Customer Registration",
        message: `${firstName} ${lastName} (${email}) has just created a new customer account.`,
        link: "/admin/customers",
        type: "REGISTRATION"
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      // Return success even if email not found for security, or indicate sent
      return { success: true, message: "If an account exists with this email, recovery instructions have been dispatched." };
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour token expiration

    // Clear old tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: cleanEmail }
    });

    await prisma.passwordResetToken.create({
      data: {
        email: cleanEmail,
        token,
        expiresAt
      }
    });

    const resetUrl = `/reset-password?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    return {
      success: true,
      resetUrl,
      message: "Reset token generated successfully."
    };
  } catch (error: any) {
    console.error("requestPasswordReset error:", error);
    return { success: false, error: error.message || "Failed to process password reset request." };
  }
}

export async function resetPasswordWithToken(data: { token: string; email: string; newPassword: string }) {
  try {
    const { token, email, newPassword } = data;
    const cleanEmail = email.trim().toLowerCase();

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        email: cleanEmail,
        expiresAt: { gt: new Date() }
      }
    });

    if (!resetRecord) {
      return { success: false, error: "Invalid or expired reset token. Please request a new password reset link." };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { email: cleanEmail },
      data: { passwordHash }
    });

    // Delete token after successful update
    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id }
    });

    return { success: true };
  } catch (error: any) {
    console.error("resetPasswordWithToken error:", error);
    return { success: false, error: error.message || "Failed to reset password." };
  }
}
