import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST kullanılır" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.MY_SERVICE_KEY
  );

  const { email, plan, credits, lang } = req.body;

  const { data, error } = await supabase
    .from("users")
    .insert({
      email,
      plan,
      credits,
      lang,
    })
    .select();

  if (error) {
    return res.status(500).json({
      message: "INSERT_ERROR",
      error: error.message,
    });
  }

  return res.status(200).json({
    message: "OK",
    user: data[0],
  });
}
