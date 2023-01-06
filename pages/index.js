import React from "react";

import {
  Container,
  Chip,
  Avatar,
  Grid,
  Button,
  Card,
  Divider,
  Pagination,
  Box,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";

import GitHubIcon from "@mui/icons-material/GitHub";

import Link from "@/components/Link";

import fetch from "node-fetch";

import siteMetadata from "@/data/siteMetadata";

export default function Home({ goodFirstIssueData }) {
  const [gfiLabels, setGfiLabels] = React.useState(goodFirstIssueData.labels);
  const [gfiIssues, setGfiIssues] = React.useState(goodFirstIssueData.issues);

  // pagination
  const [maxCount] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const indexOfLast = page * maxCount;
  const indexOfFirst = indexOfLast - maxCount;
  const issues = gfiIssues.slice(indexOfFirst, indexOfLast);
  const counter = Math.ceil(gfiIssues.length / maxCount);
  const handlePaginationChange = (event, value) => {
    setPage(value);

    window &&
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
  };

  // tags
  const [activeLabel, setActiveLabel] = React.useState("Good First Issue");
  const handleActiveLabel = (event, newActiveLabel) => {
    console.log("newActiveLabel", newActiveLabel);
    setActiveLabel(newActiveLabel);
    // move active label to the start of gfiLabels array
    const newLabels = gfiLabels.filter(
      (label) => label.label !== newActiveLabel
    );
    newLabels.unshift(
      gfiLabels.find((label) => label.label === newActiveLabel)
    );
    setGfiLabels(newLabels);
    // filter issues with newActiveLabel
    const newIssues = goodFirstIssueData.issues.filter((issue) =>
      issue.issue_labels.includes(newActiveLabel)
    );
    setGfiIssues(newIssues);

    setPage(1);

    window &&
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
  };

  return (
    <>
      <Container maxWidth="lg" component="main" sx={{ pt: 6, p: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {issues.map((issue, index) => (
              <Grid index={index} item xs={12} sx={{ boxShadow: 5, mb: 1 }}>
                <Link href={issue.issue_url} disableTooltip>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" color="text.primary">
                        <b>{issue.issue_title}</b>
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ my: 1 }}
                      >
                        <b>{issue.issue_short_url}</b>
                      </Typography>
                      <Link href={`https://github.com/${issue.issue_author}`}>
                        <IconButton aria-label="user">
                          <Avatar
                            alt={`${issue.author}`}
                            src={`https://github.com/${issue.issue_author}.png`}
                            sx={{
                              width: 32,
                              height: 32,
                            }}
                          />
                        </IconButton>
                      </Link>
                      {issue.issue_labels.map((label, index) => (
                        <Chip
                          index={index}
                          label={`${label}`}
                          variant="filled"
                          color="success"
                          size="small"
                          style={{ margin: "5px" }}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
            <Box sx={{ my: 4 }}>
              <Pagination
                count={counter}
                page={page}
                onChange={handlePaginationChange}
                style={{ justifyContent: "center", display: "flex" }}
                color="success"
                variant="outlined"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Grid item xs={12} sx={{ p: 3 }} border="1px dashed lightgreen">
              <Typography
                variant="h6"
                color="text.secondary"
                textAlign={"center"}
                sx={{ mb: 1 }}
              >
                <b>Browse by label</b>
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {gfiLabels.map((label, index) => (
                <Chip
                  index={index}
                  label={`${label.label} (${label.issue_count})`}
                  variant={activeLabel === label.label ? "filled" : "outlined"}
                  clickable={activeLabel !== label.label}
                  color="success"
                  size="medium"
                  style={{ margin: "5px" }}
                  onClick={() => handleActiveLabel(null, label.label)}
                  value={label.label}
                />
              ))}
            </Grid>

            <Grid
              item
              xs={12}
              sx={{ p: 3, my: 3 }}
              border="1px dashed lightgreen"
            >
              <Typography
                variant="h6"
                color="text.secondary"
                textAlign={"center"}
                sx={{ mb: 1 }}
              >
                <b>ABOUT</b>
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign={"center"}
                sx={{ mb: 1 }}
              >
                <b className="footer-text">{siteMetadata.description}</b>
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign={"center"}
                sx={{ mb: 1 }}
              >
                <b>Support this project by starring it on GitHub.</b>
              </Typography>
              <Link href="https://github.com/x4ty/good-1st-issue">
                <Button
                  variant="outlined"
                  color="success"
                  sx={{ mt: 2 }}
                  style={{ width: "100%" }}
                >
                  <GitHubIcon sx={{ mr: 1 }} />
                  Star on GitHub
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export async function getStaticProps() {
  const issueData = await fetch(`${process.env.BACKEND_API_URL}/good1stissue`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `TOKEN ${process.env.BACKEND_API_TOKEN}`,
    },
  }).then((res) => res.json());

  return {
    props: {
      goodFirstIssueData: issueData,
    },
    revalidate: 60,
  };
}
