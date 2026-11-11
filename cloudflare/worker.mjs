export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.protocol === "http:" && url.hostname === "braginga.net") {
      url.protocol = "https:";
      url.port = "";
      return Response.redirect(url.toString(), 308);
    }
    return env.ASSETS.fetch(request);
  },
};
