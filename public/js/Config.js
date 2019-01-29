let HTTP_CONFIG = {
    headers: {
        "Authorization": "Bearer " + localStorage.getItem("admin_token")
    }
};

let HTTP_CONFIG_USER = {
    headers: {
        "Authorization": "Bearer " + localStorage.getItem("user_token")
    }
};