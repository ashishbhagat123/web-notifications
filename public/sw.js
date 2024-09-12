self.addEventListener("push", function (event) {
  if (event.data) {
    let data = JSON.parse(event.data?.text());
    console.log(data);

    const options = {
      body: data.body,
      icon:
        data.icon ||
        "https://upload.wikimedia.org/wikipedia/commons/1/1c/Dragon_template-192px.png",
      badge:
        "https://upload.wikimedia.org/wikipedia/commons/1/1c/Dragon_template-192px.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  event.notification.close();
  event.waitUntil(clients.openWindow("<https://your-website.com>"));
});
