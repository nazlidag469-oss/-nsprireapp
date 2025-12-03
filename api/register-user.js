import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

export default async function handler(req, res) {
  try {
    const { email, plan, credits, lang } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email gerekli." });
    }

    const { data, error } = await supabase.from("users").insert([
      {
        email,
        plan: plan || "free",
        credits: credits ?? 0,
        lang: lang || "tr",
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error.message);
      return res.status(500).json({ message: "Supabase insert error" });
    }

    return res.status(200).json({ message: "OK", user: data });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
