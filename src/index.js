const CLIENT_ID =
  "97685359086-lhe16dl0llnlvhaibnoiqblmanfbdnbn.apps.googleusercontent.com";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"
];
const SCOPES = "https://www.googleapis.com/auth/youtube";

const ADD_TO_END_OF_DESC = "";
const ADD_TO_BEGINIG_OF_DESC = "";
const REPLACE_DESC_WITH = "";

const authorizeButton = document.getElementById("authorize-button");
const signoutButton = document.getElementById("signout-button");

let tmpVideos = [];
let trhreee= tmpVideos[];
let trheeStvola = tmpVideos;
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

function initClient() {
  gapi.client
    .init({
      discoveryDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES
    })
    .then(function() {
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    getChannel();
  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
  }
}

function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function getChannel() {
  gapi.client.youtube.channels
    .list({
      part: "snippet,contentDetails",
      mine: true
    })
    .then(function(response) {
      getUploads(
        response.result.items[0].contentDetails.relatedPlaylists.uploads
      );
    });
}

function getUploads(uploadsId, nextPage) {
  const requestOptions = {
    playlistId: uploadsId,
    part: "snippet",
    maxResults: 50
  };
  if (nextPage) requestOptions.pageToken = nextPage;
  gapi.client.youtube.playlistItems.list(requestOptions).then(res => {
    tmpVideos.push(res.result.items);
    if (res.result.nextPageToken) {
      getUploads(uploadsId, res.result.nextPageToken);
    } else {
      getVideos();
    }
  });
}

function getVideos() {
  tmpVideos.forEach(item => {
    gapi.client.youtube.videos
      .list({
        id: item.snippet.resourceId.videoId,
        part: "snippet,contentDetails,statistics"
      })
      .then(res => {
        console.log(res.result.items[0].snippet.title);
        gapi.client.youtube.videos
          .update(
            {
              part: "snippet"
            },
            {
              id: res.result.items[0].id,
              kind: res.result.items[0].kind,
              snippet: {
                categoryId: res.result.items[0].snippet.categoryId,
                title: res.result.items[0].snippet.title,
                description:
                  REPLACE_DESC_WITH === ""
                    ? ADD_TO_BEGINIG_OF_DESC +
                      res.result.items[0].snippet.description +
                      ADD_TO_END_OF_DESC
                    : REPLACE_DESC_WITH
              }
            }
          )
          .then(res => console.log(res));
      });
  });
}