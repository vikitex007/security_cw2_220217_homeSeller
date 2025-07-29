const fs = require("fs");
const path = require("path");

// Check if .env file exists
const envPath = path.join(__dirname, ".env");
const envExamplePath = path.join(__dirname, "env.example");

if (fs.existsSync(envPath)) {
  console.log("✅ .env file already exists");
  console.log("📝 Current .env contents:");
  console.log(fs.readFileSync(envPath, "utf8"));
} else {
  console.log("❌ .env file not found");

  // Create .env file from example
  if (fs.existsSync(envExamplePath)) {
    const envContent = fs.readFileSync(envExamplePath, "utf8");
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Created .env file from env.example");
    console.log("📝 Please update the .env file with your actual values:");
    console.log("");
    console.log("1. MONGO - Your MongoDB connection string");
    console.log("2. JWT_SECRET - A secure random string for JWT tokens");
    console.log(
      "3. STRIPE_SECRET_KEY - Your Stripe secret key (optional for testing)"
    );
    console.log(
      "4. STRIPE_PUBLISHABLE_KEY - Your Stripe publishable key (optional for testing)"
    );
    console.log("");
    console.log(
      "For testing without Stripe, you can leave the Stripe keys as placeholder values."
    );
  } else {
    console.log("❌ env.example file not found");
    console.log("📝 Creating basic .env file...");

    const basicEnvContent = `MONGO=mongodb://localhost:27017/homesell
JWT_SECRET=your_super_secret_jwt_key_here_change_this
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here`;

    fs.writeFileSync(envPath, basicEnvContent);
    console.log("✅ Created basic .env file");
    console.log("📝 Please update the values in the .env file");
  }
}

console.log("");
console.log("🔧 Next steps:");
console.log("1. Update the .env file with your actual values");
console.log("2. For MFA testing: No Stripe needed");
console.log("3. For payment testing: Get free Stripe keys from stripe.com");
console.log("4. Restart your server after updating .env");
console.log("");
console.log("📚 See SETUP.md for detailed instructions");
