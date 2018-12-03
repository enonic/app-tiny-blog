var portal = require('/lib/xp/portal'); // Import the portal library
var thymeleaf = require('/lib/xp/thymeleaf'); // Import the Thymeleaf library
var contentLib = require('/lib/xp/content');

// Handle the GET request
exports.get = function (req) {

    // Get the content that is using the page
    var content = portal.getContent();

    var data = content.data;
    //Images
    if (data.image) {
        var url = portal.imageUrl({
            id: data.image,
            scale: "width(700)",
        });
        content.data.image_url = url;

        //Manage img alt text
        if (!data["alt-text"]) {
            var imgDisplayName = contentLib.get({ key: data.image }).displayName;
            content.data["alt-text"] = imgDisplayName;
        }
    }

    content.data.content = portal.processHtml({ value: data.content });

    log.info(JSON.stringify(content.data.content));

    //Data used on page
    var model = {
        post: content,
    }

    //What html document to use
    var view = resolve('blog-show.html');
    var css = portal.assetUrl({ path: "style.css" });

    // Return the merged view and model in the response object
    return {
        body: thymeleaf.render(view, model),
        pageContributions: {
            headBegin: [
                '<link rel="stylesheet" href="' + css + '" />',
            ],
        }
    }
};