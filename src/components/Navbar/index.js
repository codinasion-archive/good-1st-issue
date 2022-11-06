// mui components
import {
  AppBar,
  Box,
  CssBaseline,
  Fab,
  Toolbar,
  Typography,
  useScrollTrigger,
  Zoom,
} from "@mui/material";

import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// custom Link component
import Link from "@/components/Link";

import siteMetadata from "@/data/siteMetadata";

function ScrollTop(props) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      "#back-to-top"
    );

    if (anchor) {
      anchor.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      >
        {children}
      </Box>
    </Zoom>
  );
}

function Navbar() {
  return (
    <>
      <CssBaseline />
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          backdropFilter: "blur(20px)",
          textAlign: "center",
        }}
      >
        <Toolbar sx={{ flexWrap: "wrap" }}>
          <Typography
            variant="h4"
            component="bold"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1, my: 2 }}
          >
            <Link
              href={`/`}
              color="text.primary"
              sx={{ my: 1, mx: 1.5 }}
              className="logo"
            >
              <b>{siteMetadata.title}</b>
            </Link>
          </Typography>
        </Toolbar>
      </AppBar>
      <div id="back-to-top" />
      <ScrollTop>
        <Fab color="success" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </>
  );
}

export default Navbar;
