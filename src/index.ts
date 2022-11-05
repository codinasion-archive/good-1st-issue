import { Probot } from "probot";

import fetch from "node-fetch";

import { FormatToPascalCase } from "dummy-code"

export = (app: Probot) => {
  app.log.info("Yay, the app was loaded !!!");

  // on issue labeled 'good first issue' or 'good-first-issue' or 'good_first_issue'
  // schedule a tweet
  app.on("issues.labeled", async (context: any) => {
    const issue = context.payload.issue;
    const label = context.payload.label.name;

    // if issue is labeled with 'good first issue' or 'good-first-issue' or 'good_first_issue' and
    // if repository visibility is public and
    // if there is no assignee and
    // if issue status is 'open' and
    if (
      FormatToPascalCase(label.toLowerCase()) === "GoodFirstIssue" &&
      context.payload.repository.private === false &&
      issue.assignee === null &&
      issue.state === "open"
    ) {
      const issue_title = issue.title;
      const issue_url = issue.html_url;
      const issue_label = await FormatToPascalCase(label);
      const issue_author = issue.user.login;

      // get latest issue data from the Github API
      const latestIssueData: any = await fetch(
        `https://api.github.com/repos/${context.payload.repository.full_name}/issues/${issue.number}`
      )
        .then((res) => res.json())
        .catch((err) => console.log(err));

      // if there is no assignee and
      // 'good first issue' or 'good-first-issue' or 'good_first_issue' label is available (for accidental labeled issues) and
      // issue status is 'open'
      if (
        latestIssueData.assignee === null &&
        latestIssueData.labels.some(
          (label: any) =>
            FormatToPascalCase(label.name.toLowerCase()) === "GoodFirstIssue"
        ) &&
        latestIssueData.state === "open"
      ) {
        const latestIssueLabels = await latestIssueData.labels.map(
          (label: any) => label.name.toLowerCase()
        );

        // make hash text of labels (e.g. '#Label1 #Label2 #Label3')
        var labelsString = "";
        for (const label of latestIssueLabels) {
          labelsString = labelsString + `#${await FormatToPascalCase(label)} `;
        }

        // tweet text
        const tweet = `Hey Geeks,

An issue got labeled with #${issue_label} for ${context.payload.repository.full_name}#${issue.number}`;

        // make a POST request to the Tweet API (Not Twitter API)
        await fetch(
          `${process.env.BACKEND_API_URL}/good1stissue/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${process.env.BACKEND_API_TOKEN}`,
            },
            body: JSON.stringify({
              tweet_text: tweet,
              issue_title: issue_title,
              issue_author: issue_author,
              labels_text: labelsString,
              issue_url: issue_url,
            }),
          }
        )
          .then((res) => res.text())
          .then((text) => app.log.info(text))
          .catch((err) => console.log(err));
      }
    }
  });

  // on issue unlabeled 'good first issue' or 'good-first-issue' or 'good_first_issue'
  // delete the scheduled/tweeted tweet (if scheduled)
  app.on("issues.unlabeled", async (context: any) => {
    const issue = context.payload.issue;
    const label = context.payload.label.name;

    // if issue is unlabeled with 'good first issue' or 'good-first-issue' or 'good_first_issue' and
    if (
      FormatToPascalCase(label.toLowerCase()) === "GoodFirstIssue"
    ) {
      // make a DELETE request to the Tweet API (Not Twitter API)
      await fetch(
        `${process.env.BACKEND_API_URL}/good1stissue/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${process.env.BACKEND_API_TOKEN}`,
          },
          body: JSON.stringify({
            issue_url: issue.html_url,
          }),
        }
      )
        .then((res) => res.text())
        .then((text) => app.log.info(text))
        .catch((err) => console.log(err));
    }
  });

  // on issue closed (regardless of the label)
  // delete the scheduled/tweeted tweet (if scheduled)
  app.on("issues.closed", async (context: any) => {
    await app.log.info("Issue closed");

    const issue = context.payload.issue;

    await app.log.info("Issue closed");

    // make a DELETE request to the Tweet API (Not Twitter API)
    await fetch(
      `${process.env.BACKEND_API_URL}/good1stissue/`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${process.env.BACKEND_API_TOKEN}`,
        },
        body: JSON.stringify({
          issue_url: issue.html_url,
        }),
      }
    )
      .then((res) => res.text())
      .then((text) => app.log.info(text))
      .catch((err) => console.log(err));
  });

  // on issue reopened and
  // if issue is labeled with 'good first issue' or 'good-first-issue' or 'good_first_issue' and
  // if repository visibility is public and
  // if there is no assignee
  // schedule a tweet
  app.on("issues.reopened", async (context: any) => {
    const issue = context.payload.issue;

    // if issue is labeled with 'good first issue' or 'good-first-issue' or 'good_first_issue' and
    // if repository visibility is public and
    // if there is no assignee and
    // if issue status is 'open' and
    if (
      issue.labels.some(
        (label: any) =>
          FormatToPascalCase(label.name.toLowerCase()) === "GoodFirstIssue"
      ) &&
      context.payload.repository.private === false &&
      issue.assignee === null &&
      issue.state === "open"
    ) {
      const issue_title = issue.title;
      const issue_url = issue.html_url;
      const issue_label = await FormatToPascalCase(
        issue.labels.find(
          (label: any) =>
            FormatToPascalCase(label.name.toLowerCase()) === "GoodFirstIssue"
        ).name
      );
      const issue_author = issue.user.login;

      const issueLabels = await issue.labels.map(
        (label: any) => label.name.toLowerCase()
      );

      // make hash text of labels (e.g. '#Label1 #Label2 #Label3')
      var labelsString = "";
      for (const label of issueLabels) {
        labelsString = labelsString + `#${await FormatToPascalCase(label)} `;
      }

      // tweet text
      const tweet = `Hey Geeks,

An issue got labeled with #${issue_label} for ${context.payload.repository.full_name}#${issue.number}`;

      // make a POST request to the Tweet API (Not Twitter API)
      await fetch(
        `${process.env.BACKEND_API_URL}/good1stissue/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${process.env.BACKEND_API_TOKEN}`,
          },
          body: JSON.stringify({
            tweet_text: tweet,
            issue_title: issue_title,
            issue_author: issue_author,
            labels_text: labelsString,
            issue_url: issue_url,
          }),
        }
      )
        .then((res) => res.text())
        .then((text) => app.log.info(text))
        .catch((err) => console.log(err));
    }
  });

  // on issue assigned and
  // if issue is labeled with 'good first issue' or 'good-first-issue' or 'good_first_issue' and
  // if repository visibility is public
  // delete the scheduled/tweeted tweet (if scheduled)
  app.on("issues.assigned", async (context: any) => {
    const issue = context.payload.issue;

    // if issue is labeled with 'good first issue' or 'good-first-issue' or 'good_first_issue' and
    // if repository visibility is public
    if (
      issue.labels.some(
        (label: any) =>
          FormatToPascalCase(label.name.toLowerCase()) === "GoodFirstIssue"
      ) &&
      context.payload.repository.private === false
    ) {
      // make a DELETE request to the Tweet API (Not Twitter API)
      await fetch(
        `${process.env.BACKEND_API_URL}/good1stissue/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${process.env.BACKEND_API_TOKEN}`,
          },
          body: JSON.stringify({
            issue_url: issue.html_url,
          }),
        }
      )
        .then((res) => res.text())
        .then((text) => app.log.info(text))
        .catch((err) => console.log(err));
    }
  });

  // on issue unassigned and
  // if issue is labeled with 'good first issue' or 'good-first-issue' or 'good_first_issue' and
  // if repository visibility is public and
  // if there is no assignee
  // schedule a tweet
  app.on("issues.unassigned", async (context: any) => {
    const issue = context.payload.issue;

    // if issue is labeled with 'good first issue' or 'good-first-issue' or 'good_first_issue' and
    // if repository visibility is public and
    // if there is no assignee and
    // if issue status is 'open'
    if (
      issue.labels.some(
        (label: any) =>
          FormatToPascalCase(label.name.toLowerCase()) === "GoodFirstIssue"
      ) &&
      context.payload.repository.private === false &&
      issue.assignee === null &&
      issue.state === "open"
    ) {
      const issue_title = issue.title;
      const issue_url = issue.html_url;
      const issue_label = await FormatToPascalCase(
        issue.labels.find(
          (label: any) =>
            FormatToPascalCase(label.name.toLowerCase()) === "GoodFirstIssue"
        ).name
      );
      const issue_author = issue.user.login;

      const issueLabels = await issue.labels.map(
        (label: any) => label.name.toLowerCase()
      );

      // make hash text of labels (e.g. '#Label1 #Label2 #Label3')
      var labelsString = "";
      for (const label of issueLabels) {
        labelsString = labelsString + `#${await FormatToPascalCase(label)} `;
      }

      // tweet text
      const tweet = `Hey Geeks,

An issue got labeled with #${issue_label} for ${context.payload.repository.full_name}#${issue.number}`;

      // make a POST request to the Tweet API (Not Twitter API)
      await fetch(
        `${process.env.BACKEND_API_URL}/good1stissue/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${process.env.BACKEND_API_TOKEN}`,
          },
          body: JSON.stringify({
            tweet_text: tweet,
            issue_title: issue_title,
            issue_author: issue_author,
            labels_text: labelsString,
            issue_url: issue_url,
          }),
        }
      )
        .then((res) => res.text())
        .then((text) => app.log.info(text))
        .catch((err) => console.log(err));
    }
  });

  // on issue deleted (regarless of label) and
  // if repository visibility is public
  // delete the scheduled/tweeted tweet (if scheduled)
  app.on("issues.deleted", async (context: any) => {
    const issue = context.payload.issue;

    // if repository visibility is public
    if (context.payload.repository.private === false) {
      // make a DELETE request to the Tweet API (Not Twitter API)
      await fetch(
        `${process.env.BACKEND_API_URL}/good1stissue/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${process.env.BACKEND_API_TOKEN}`,
          },
          body: JSON.stringify({
            issue_url: issue.html_url,
          }),
        }
      )
        .then((res) => res.text())
        .then((text) => app.log.info(text))
        .catch((err) => console.log(err));
    }
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
