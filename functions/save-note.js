export default async (req) => {
    // Only POST is allowed
    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({
                error: "Method not allowed"
            }),
            {
                status: 405,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
    // Check our private Shortcut token
    const token =
        req.headers.get("x-save-token");
    if (
        !token ||
        token !== process.env.SAVE_TOKEN
    ) {
        return new Response(
            JSON.stringify({
                error: "Unauthorized"
            }),
            {
                status: 401,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
    // Read request body
    let body;
    try {
        body = await req.json();
    } catch {
        return new Response(
            JSON.stringify({
                error: "Invalid JSON"
            }),
            {
                status: 400,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
    const text =
        typeof body.text === "string"
            ? body.text.trim()
            : "";

    if (!text) {
        return new Response(
            JSON.stringify({
                error: "Text is required"
            }),
            {
                status: 400,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

    const url =
        typeof body.url === "string"
            ? body.url
            : null;

    const pageTitle =
        typeof body.page_title === "string"
            ? body.page_title
            : "Saved from Safari";

    // Insert into Supabase
    const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/notes`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",

                "apikey":
                    process.env.SUPABASE_SECRET_KEY,

                "Authorization":
                    `Bearer ${process.env.SUPABASE_SECRET_KEY}`,

                "Prefer":
                    "return=minimal"
            },
            body: JSON.stringify({
                user_id:
                    process.env.SUPABASE_USER_ID,

                text,

                url,

                page_title:
                    pageTitle
            })
        }
    );

    if (!response.ok) {
        const errorText =
            await response.text();

        console.error(
            "Supabase error:",
            errorText
        );

        return new Response(
            JSON.stringify({
                error:
                    "Could not save note"
            }),
            {
                status: 500,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );
    }

    return new Response(
        JSON.stringify({
            success: true
        }),
        {
            status: 200,
            headers: {
                "Content-Type":
                    "application/json"
            }
        }
    );
};

export const config = {
    path: "/api/save-note"
};