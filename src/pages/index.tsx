import Head from "next/head";
import { useRef, useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Skeleton,
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function Home() {
  const MAX_LENGTH = 500;
  const [text, setText] = useState("");
  const [error, setError] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("info");

  const showSnackbar = (message: string, severity: "success" | "error" | "info" = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleGenerate = async () => {
    if (text.trim() !== "") {
      if (text.length > MAX_LENGTH) {
        showSnackbar("Input exceeds the 500 character limit!", "error");
        return;
      }
      setGenerated(false);
      setLoading(true);
      await new Promise((res) => setTimeout(res, 2000));
      setLoading(false);
      setGenerated(true);
    }
  };

  const handleClear = () => {
    setText("");
    setGenerated(false);
    setLoading(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    showSnackbar("QR code downloaded successfully!", "success");
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        showSnackbar("QR code copied to clipboard!", "success");
      } catch (err) {
        showSnackbar("Failed to copy QR code!", "error");
        console.log("Failed to copy image.", err);
      }
    });
  };

  return (
    <>
      <Head>
        <title>QR Code Generator</title>
        <meta name="description" content="Generate QR codes instantly!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="favicon.ico" />
      </Head>

      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper
          elevation={12}
          sx={{
            p: { xs: 3, sm: 4 },
            maxWidth: 500,
            width: "100%",
            borderRadius: 3,
            background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
            border: "2px solid #9c27b0",
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            mb={3}
          >
            {(loading || !generated) && (
              <>
                <Skeleton
                  variant="rectangular"
                  width={250}
                  height={250}
                  sx={{ borderRadius: 2 }}
                />
                <Typography
                  variant="caption"
                  sx={{ mt: 1, color: "text.secondary" }}
                >
                  {loading ? "Generating QR code..." : "Waiting for input..."}
                </Typography>
              </>
            )}

            {generated && !loading && (
              <>
                <Box>
                  <QRCodeCanvas value={text} size={250} ref={canvasRef} />
                </Box>
                <Stack direction="row" spacing={1} mt={1}>
                  <Tooltip title="Download QR Code">
                    <IconButton sx={{ color: "#1976d2" }} onClick={handleDownload}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy QR as PNG">
                    <IconButton sx={{ color: "#388e3c" }} onClick={handleCopyImage}>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </>
            )}
          </Box>

          <Typography
            variant="h4"
            textAlign="center"
            gutterBottom
            sx={{
              background: "linear-gradient(to right, #9c27b0, #673ab7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
            }}
          >
            QR Code Generator
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, textAlign: "center" }}
          >
            Enter any text, URL, or contact info to generate a QR code.
          </Typography>

          <Stack spacing={2}>
            <TextField
              size="small"
              label="Enter text or URL"
              value={text}
              onChange={(e) => {
                const newText = e.target.value;
                if (newText.length > MAX_LENGTH) {
                  setError(true);
                } else {
                  setError(false);
                }
                setText(newText);
                setGenerated(false);
              }}
              error={error}
              helperText={
                error
                  ? `Character limit exceeded! (${text.length}/${MAX_LENGTH})`
                  : `${text.length}/${MAX_LENGTH} characters`
              }
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              sx={{
                backgroundColor: "#fff",
                borderRadius: 1,
              }}
            />

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={handleGenerate}
                disabled={!text || loading}
                sx={{
                  background: "linear-gradient(45deg, #43cea2, #185a9d)",
                  color: "#000",
                  px: 4,
                }}
              >
                {loading ? "Generating..." : "Generate QR"}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClear}
                disabled={!text || loading}
                sx={{
                  borderColor: "#f50057",
                  color: "#f50057",
                }}
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* Snackbar Alert */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="standard">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
