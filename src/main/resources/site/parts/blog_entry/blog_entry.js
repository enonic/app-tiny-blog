var portal = require('/lib/xp/portal'); // Import the portal library
var thymeleaf = require('/lib/xp/thymeleaf'); // Import the Thymeleaf library
var contentLib = require('/lib/xp/content');

// Handle the GET request
exports.get = function (req) {

    // Get the content that is using the page
    var content = portal.getContent();


    log.info("test");

    var blog_folder = contentLib.get({
        key: portal.getSite()._path + "/blog-posts",
    });

    log.info("blog_folder");

    if (!blog_folder) {
        blog_folder = contentLib.create({
            name: "blog-posts",
            displayName: "Blog posts",
            parentPath: portal.getSite()._path,
            contentType: "base:folder",
            data: {},
        });
    }

    var blog_entries = contentLib.getChildren({
        key: blog_folder._path,
    });

    log.info(JSON.stringify(blog_entries, null, 2));

    // Prepare the model that will be passed to the view
    var model = {
        blog_entries: blog_entries.hits,
        content: content
    }

    // Specify the view file to use
    var view = resolve('blog_entry.html');

    // Return the merged view and model in the response object
    return {
        body: thymeleaf.render(view, model)
    }
};