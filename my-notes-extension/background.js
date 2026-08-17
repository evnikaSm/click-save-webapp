importScripts("supabase.min.js");
/* ========================================
   SUPABASE
   ======================================== */
const SUPABASE_URL =
    "https://spgyrwiexbpsuzxovjex.supabase.co";
const SUPABASE_KEY =
    "sb_publishable_cJTtSTCWL3aQ2tI0F8RwLQ_YQJ8bFTT";
const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
console.log(
    "Supabase client created"
);
console.log(
    "My Notes background loaded"
);
/* ========================================
   CHECK SUPABASE USER
   ======================================== */
async function getCurrentUser() {
    const {
        data,
        error
    } = await supabaseClient.auth.getUser();
    if (error) {
        console.error(
            "Supabase getUser error:",
            error
        );
        return null;
    }
    return data.user;
}
/* ========================================
   SAVE NOTE
   ======================================== */
async function saveNote(pageData, user) {
    if (!pageData) {
        console.error(
            "No page data to save."
        );
        return false;
    }
    if (!user) {
        console.error(
            "No logged-in user."
        );
        return false;
    }
    console.log(
        "Saving note...",
        pageData
    );
    const {
        data,
        error
    } = await supabaseClient
        .from("notes")
        .insert({
            user_id: user.id,
            text:
                pageData.text || "",
            url:
                pageData.url || null,
            page_title:
                pageData.pageTitle || null
        })
        .select()
        .single();
    if (error) {
        console.error(
            "Save note error:",
            error
        );
        return false;
    }
    console.log(
        "NOTE SAVED:");
    return true;
}
/* ========================================
   GOOGLE LOGIN
   ======================================== */

async function loginWithGoogle() {

    const redirectUrl =
        chrome.identity.getRedirectURL();
    const authUrl =
        SUPABASE_URL +
        "/auth/v1/authorize" +
        "?provider=google" +
        "&redirect_to=" +
        encodeURIComponent(redirectUrl);

    console.log(
        "Starting Google OAuth..."
    );
    try {
        const responseUrl =
            await chrome.identity.launchWebAuthFlow({
                url: authUrl,
                interactive: true
            });

        return responseUrl;
    } catch (error) {
        console.error(
            "Google OAuth error:",
            error
        );
        return null;
    }
}
/* ========================================
   HANDLE GOOGLE OAUTH CALLBACK
   ======================================== */
async function handleOAuthCallback(responseUrl) {
    console.log(
        "Handling OAuth callback..."
    );
    if (!responseUrl) {
        console.error(
            "No OAuth response URL."
        );
        return null;
    }
    const url =
        new URL(responseUrl);

    /*
       Supabase returns the tokens in the URL hash.
    */
    const hash =
        url.hash.substring(1);
    const params =
        new URLSearchParams(hash);
    const accessToken =
        params.get("access_token");
    const refreshToken =
        params.get("refresh_token");
    if (!accessToken || !refreshToken) {
        console.error(
            "OAuth tokens not found."
        );

        return null;
    }
    console.log(
        "OAuth tokens received."
    );
    /*
       Create Supabase session inside the extension.
    */
    const {
        data,
        error
    } = await supabaseClient.auth.setSession({
        access_token:
            accessToken,
        refresh_token:
            refreshToken
    });
    if (error) {
        console.error(
            "Could not create Supabase session:",
            error
        );
        return null;
    }
    return data.user;
}

/* ========================================
   CONTEXT MENU
   ======================================== */
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "save-to-my-notes",
        title: "Save to My Notes",
        contexts: ["selection"]
    });
});
/* ========================================
   CONTEXT MENU CLICK
   ======================================== */
chrome.contextMenus.onClicked.addListener(
    async (info, tab) => {
        if (
            info.menuItemId !==
            "save-to-my-notes"
        ) {
            return;
        }
        console.log(
            "Save to My Notes clicked"
        );
        /* ========================================
           GET USER
           ======================================== */
        let user =
            await getCurrentUser();
        /*
           If the user is not logged in,
           start Google login.
        */
        if (!user) {

            console.log(
                "No session. Starting Google login..."
            );
            const responseUrl =
                await loginWithGoogle();
            user =
                await handleOAuthCallback(
                    responseUrl
                );
            if (!user) {

                console.error(
                    "Could not log in."
                );

                return;
            }
        }
        /* ========================================
           PAGE DATA
           ======================================== */
        const pageData = {
            text:
                info.selectionText || "",
            url:
                tab.url || null,
            pageTitle:
                tab.title || null
        };
        /* ========================================
           SAVE
           ======================================== */
        const saved =
            await saveNote(
                pageData,
                user
            );
        console.log(
            "SAVE RESULT:",
            saved
        );
    }
);