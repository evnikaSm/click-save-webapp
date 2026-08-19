export default async (req) => {
    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({ error: "Method not allowed" }),
            {
                status: 405,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    const token = req.headers.get("x-save-token");

    if (!token) {
        return new Response(
            JSON.stringify({ error: "Missing token" }),
            {
                status: 401,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    let body;

    try {
        body = await req.json();
    } catch {
        return new Response(
            JSON.stringify({ error: "Invalid JSON" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    const text =
        typeof body.text === "string"
            ? body.text.trim()
            : "";

    if (!text) {
        return new Response(
            JSON.stringify({ error: "Text is required" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    const supabaseUrl =
        process.env.SUPABASE_URL;

    const supabaseSecret =
        process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecret) {
        return new Response(
            JSON.stringify({ error: "Server configuration error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    // Ищем пользователя по Shortcut token
    const tokenResponse = await fetch(
        `${supabaseUrl}/rest/v1/shortcut_tokens?token=eq.${encodeURIComponent(token)}&select=user_id`,
        {
            headers: {
                apikey: supabaseSecret,
                Authorization: `Bearer ${supabaseSecret}`
            }
        }
    );

    if (!tokenResponse.ok) {
        const errorText =
            await tokenResponse.text();

        console.error(
            "Token lookup error:",
            errorText
        );

        return new Response(
            JSON.stringify({ error: "Could not verify token" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    const tokenRows =
        await tokenResponse.json();

    if (
        !Array.isArray(tokenRows) ||
        tokenRows.length === 0
    ) {
        return new Response(
            JSON.stringify({ error: "Invalid token" }),
            {
                status: 401,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    const userId =
        tokenRows[0].user_id;

    const noteResponse = await fetch(
        `${supabaseUrl}/rest/v1/notes`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: supabaseSecret,
                Authorization: `Bearer ${supabaseSecret}`,
                Prefer: "return=minimal"
            },
            body: JSON.stringify({
                user_id: userId,
                text: text,
                url:
                    typeof body.url === "string"
                        ? body.url
                        : null,
                page_title:
                    typeof body.page_title === "string"
                        ? body.page_title
                        : "Saved from Safari"
            })
        }
    );

    if (!noteResponse.ok) {
        const errorText =
            await noteResponse.text();

        console.error(
            "Note insert error:",
            errorText
        );

        return new Response(
            JSON.stringify({ error: "Could not save note" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    return new Response(
        JSON.stringify({
            success: true
        }),
        {
            status: 200,
            headers: { "Content-Type": "application/json" }
        }
    );
};

export const config = {
    path: "/api/save-note"
};