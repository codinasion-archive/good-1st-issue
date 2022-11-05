// mui components
import { Typography } from "@mui/material";

// custom Link component
import Link from "@/components/Link";

export default function FooterText(props) {
  return (
    <Typography
      variant="body1"
      color="text.secondary"
      align="center"
      {...props}
    >
      <b className="footer-text">
        {"Made with ❤️ by "}
        <Link color="inherit" href="https://github.com/codinasion">
          Codinasion
        </Link>
      </b>
    </Typography>
  );
}
