var portal = require('/lib/xp/portal'); // Import the portal library
var thymeleaf = require('/lib/xp/thymeleaf'); // Import the Thymeleaf library
var contentLib = require('/lib/xp/content');

function createModel() {
    var content = portal.getContent();

    //query select all blog entries under this content.
    var blog = contentLib.query({
        start: 0,
        count: 150,
        sort: "publish.from DESC, modifiedTime DESC",
        query: "_path LIKE '/content" + content._path + "/*'",
        contentTypes: [
            app.name + ":blog-post",
        ],
    });

    //Go over all images and add the url
    for (var i = 0; i < blog.hits.length; i++) {
        var data = blog.hits[i].data;
        //Images
        if (data.image) {
            var url = portal.imageUrl({
                id: data.image,
                scale: "width(1000)",
            });
            blog.hits[i].data.image_url = url;

            //Manage img alt text
            if (!data["alt-text"]) {
                var imgDisplayName = contentLib.get({ key: data.image }).displayName;
                blog.hits[i].data["alt-text"] = imgDisplayName;
            }
        }


        blog.hits[i].blogUrl = portal.pageUrl({ id: blog.hits[i]._id });

        //Content is only shown on single page
        //blog.hits[i].data.content = portal.processHtml({ value: data.content });

        if (blog.hits[i].publish.from) {
            blog.hits[i].data.date = formatDate(blog.hits[i].publish.from);
        } else {
            blog.hits[i].data.date = formatDate(blog.hits[i].modifiedTime);
        }


    }

    //Page title fallback
    var siteconfig = portal.getSiteConfig();
    var title = content.displayName;
    var showheader = true;

    var blogConfig = siteconfig.blogConfig;
    if (siteconfig != null && blogConfig) {
        var selected = blogConfig._selected;
        log.info(selected);
        if (typeof selected !== "undefined") {
            title = blogConfig[selected].header || content.displayName;
        }
        else {
            showheader = false;
        }
    }

    var config = {
        blogposts: blog.hits,
        showheader: showheader,
        title: title,
    };

    return config;
}

//Takes a iso 8601 date string and optional seperator
function formatDate(dateString, seperator) {
    var dateNumber = Date.parse(dateString);
    var date = new Date(dateNumber);
    if (!seperator) {
        seperator = "/";
    }
    var outString = "";
    //var hours = ('0' + date.getHours()).slice(-2);
    //var minutes = ('0' + date.getMinutes()).slice(-2);

    //outString += hours + ":" + minutes + " ";
    outString += date.getDate() + seperator;
    outString += (date.getMonth() + 1) + seperator;
    outString += date.getFullYear();

    return outString;
}

// Handle the GET request
exports.get = function (req) {

    var css = portal.assetUrl({ path: "style.css" });

    var model = createModel();
    var view = resolve('blog-overview.html');

    var addition = [];
    var pageConfig = portal.getSiteConfig();
    if (pageConfig.defaultStyle) {
        addition.push('<link rel="stylesheet" href="' + css + '" />');
    }

    //Body rendered page. Append stylesheet to head.
    return {
        body: thymeleaf.render(view, model),
        pageContributions: {
            headBegin: addition,
        }
    };
};




