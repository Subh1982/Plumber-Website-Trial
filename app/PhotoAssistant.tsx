"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type SelectedPhoto = {
  file: File;
  name: string;
  url: string;
};

type Assessment = {
  category: string;
  headline: string;
  observations: string[];
  confidence: "low" | "medium" | "high";
  recommendedService: string;
  urgency: "routine" | "same_day" | "call_now";
  safetyCode: string | null;
  safetyMessage: string | null;
  followUpQuestions: string[];
  requiresInspection: boolean;
};

const MAX_PHOTOS = 3;
const MAX_SOURCE_PHOTO_BYTES = 12 * 1024 * 1024;
const MAX_PROCESSED_PHOTO_BYTES = 1_400_000;
const MAX_IMAGE_DIMENSION = 1_600;
const ALLOWED_SOURCE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function PhotoAssistant() {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [problem, setProblem] = useState("leak");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  async function selectPhotos(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    setError("");
    setAssessment(null);

    if (selectedFiles.length > MAX_PHOTOS) {
      setError(`Please choose no more than ${MAX_PHOTOS} photos.`);
      event.target.value = "";
      return;
    }
    if (selectedFiles.some((file) => !ALLOWED_SOURCE_TYPES.has(file.type))) {
      setError("Please choose JPEG, PNG or WebP photos only.");
      event.target.value = "";
      return;
    }
    if (selectedFiles.some((file) => file.size > MAX_SOURCE_PHOTO_BYTES)) {
      setError("Each original photo must be 12 MB or smaller.");
      event.target.value = "";
      return;
    }

    setPreparing(true);
    try {
      const processedFiles = await Promise.all(
        selectedFiles.map((file, index) => preparePhoto(file, index)),
      );
      releasePreviewUrls();
      const nextPhotos = processedFiles.map((file) => ({
        file,
        name: file.name,
        url: URL.createObjectURL(file),
      }));
      photoUrlsRef.current = nextPhotos.map((photo) => photo.url);
      setPhotos(nextPhotos);
    } catch {
      setError("We couldn’t prepare one of those photos. Please try a different JPEG, PNG or WebP image.");
      event.target.value = "";
    } finally {
      setPreparing(false);
    }
  }

  async function analysePhotos() {
    if (photos.length === 0 || busy) return;
    setBusy(true);
    setError("");

    const formData = new FormData();
    formData.set("problem", problem);
    photos.forEach((photo) => formData.append("photos", photo.file, photo.name));

    try {
      const response = await fetch("/api/photo-assessment", {
        method: "POST",
        body: formData,
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error(
          isRecord(result) && typeof result.error === "string"
            ? result.error
            : "We couldn’t assess these photos. Please try again.",
        );
      }

      const parsed = parseAssessmentResult(result);
      if (!parsed) throw new Error("The photo assessment response was invalid.");
      setAssessment(parsed);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We couldn’t assess these photos. Please send an enquiry or call 0492205682.",
      );
    } finally {
      setBusy(false);
    }
  }

  function releasePreviewUrls() {
    photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    photoUrlsRef.current = [];
  }

  function clearPhotos() {
    releasePreviewUrls();
    setPhotos([]);
    setAssessment(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") setOpen(false);
  }

  return (
    <aside className="photo-assistant" onKeyDown={handleKeyDown}>
      {open && (
        <section
          className="photo-assistant-panel"
          role="dialog"
          aria-label="Photo Assistant"
        >
          <header className="photo-assistant-header">
            <span className="photo-assistant-header-icon" aria-hidden="true">▣</span>
            <div>
              <strong>Photo Assistant</strong>
              <small>AI visual guidance · Plumber confirmation required</small>
            </div>
            <button
              type="button"
              className="photo-assistant-close"
              onClick={() => setOpen(false)}
              aria-label="Close Photo Assistant"
            >
              ×
            </button>
          </header>

          <div className="photo-assistant-content" aria-busy={busy || preparing}>
            {!assessment ? (
              <>
                <div className="photo-assistant-intro">
                  <span className="photo-assistant-step">STEP 1 OF 2</span>
                  <h2>Show us what’s happening</h2>
                  <p>Add up to three clear photos. They are securely processed for this assessment and are not stored in your account or our database.</p>
                </div>

                {photos.length === 0 ? (
                  <button
                    type="button"
                    className="photo-upload-zone"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={preparing}
                  >
                    <span className="photo-upload-icon" aria-hidden="true">▣</span>
                    <strong>{preparing ? "Preparing photos…" : "Take or choose photos"}</strong>
                    <small>JPEG, PNG or WebP · Up to 3 photos</small>
                    <span className="photo-upload-action">Choose photos</span>
                  </button>
                ) : (
                  <div className="photo-preview-area">
                    <div className="photo-preview-grid">
                      {photos.map((photo, index) => (
                        <figure className="photo-preview" key={photo.url}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.url} alt={`Selected plumbing photo ${index + 1}`} />
                          <figcaption>{index + 1} of {photos.length}</figcaption>
                        </figure>
                      ))}
                    </div>
                    <div className="photo-preview-controls">
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={busy}>Replace photos</button>
                      <button type="button" onClick={clearPhotos} disabled={busy}>Remove</button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  className="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(event) => void selectPhotos(event)}
                  aria-label="Choose plumbing photos"
                />

                <label className="photo-problem-field">
                  <span>What best describes the problem?</span>
                  <select
                    value={problem}
                    onChange={(event) => setProblem(event.target.value)}
                    disabled={busy}
                  >
                    <option value="leak">Visible leak or dripping water</option>
                    <option value="drain">Blocked or overflowing drain</option>
                    <option value="toilet">Toilet problem</option>
                    <option value="hot-water">Hot-water system</option>
                    <option value="unsure">I’m not sure</option>
                  </select>
                </label>

                <div className="photo-safety-note">
                  <b aria-hidden="true">!</b>
                  <p>Don’t approach gas, sewage, exposed wiring or standing water to take a photo. For immediate danger, call 000.</p>
                </div>

                {error && <p className="photo-assistant-error" role="alert">{error}</p>}

                <button
                  type="button"
                  className="photo-assistant-primary"
                  disabled={photos.length === 0 || busy || preparing}
                  onClick={() => void analysePhotos()}
                >
                  {busy ? "Assessing photos…" : "Analyse photos"}<span>{busy ? "●" : "→"}</span>
                </button>
              </>
            ) : (
              <div className="photo-sample-result">
                <span className="photo-assistant-step">STEP 2 OF 2 · AI ASSESSMENT</span>
                <div className="photo-result-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photos[0]?.url} alt="Selected plumbing problem" />
                  <span>Preliminary assessment</span>
                </div>
                <small>Possible visible issue · {assessment.confidence} confidence</small>
                <h2>{assessment.headline}</h2>
                <ul className="photo-result-observations">
                  {assessment.observations.map((observation) => <li key={observation}>{observation}</li>)}
                </ul>

                {assessment.safetyMessage && (
                  <div className="photo-result-safety" role="alert">
                    <b>Safety alert</b>
                    <p>{assessment.safetyMessage}</p>
                  </div>
                )}

                <div className="photo-result-facts">
                  <div><small>Suggested service</small><strong>{assessment.recommendedService}</strong></div>
                  <div><small>Recommended timing</small><strong>{urgencyLabel(assessment.urgency)}</strong></div>
                </div>

                {assessment.followUpQuestions.length > 0 && (
                  <div className="photo-follow-up">
                    <small>Questions a plumber may ask</small>
                    <ul>{assessment.followUpQuestions.map((question) => <li key={question}>{question}</li>)}</ul>
                  </div>
                )}

                <div className="photo-result-actions">
                  <a href="#contact" onClick={() => setOpen(false)}>Send an enquiry</a>
                  <a href="tel:+61492205682">Call 0492205682</a>
                </div>
                <button type="button" className="photo-assistant-reset" onClick={() => setAssessment(null)}>← Back to photos</button>
                <p className="photo-result-disclaimer">AI-generated preliminary guidance only—not a diagnosis, quotation or safety confirmation.</p>
              </div>
            )}
          </div>
        </section>
      )}

      <button
        className="photo-assistant-toggle"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Close Photo Assistant" : "Open Photo Assistant"}
      >
        <span className="photo-assistant-toggle-icon" aria-hidden="true">▣</span>
        <span><b>Check a photo</b><small>AI visual guidance</small></span>
      </button>
    </aside>
  );
}

async function preparePhoto(source: File, index: number) {
  const image = await createImageBitmap(source);
  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    let quality = 0.84;
    let blob = await canvasToJpeg(canvas, quality);
    while (blob.size > MAX_PROCESSED_PHOTO_BYTES && quality > 0.48) {
      quality -= 0.1;
      blob = await canvasToJpeg(canvas, quality);
    }
    if (blob.size > MAX_PROCESSED_PHOTO_BYTES) {
      throw new Error("The processed image is too large.");
    }

    return new File([blob], `plumbing-photo-${index + 1}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    image.close();
  }
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Photo compression failed.")),
      "image/jpeg",
      quality,
    );
  });
}

function parseAssessmentResult(value: unknown): Assessment | null {
  if (!isRecord(value) || !isRecord(value.assessment)) return null;
  const assessment = value.assessment;
  if (
    typeof assessment.category !== "string" ||
    typeof assessment.headline !== "string" ||
    !Array.isArray(assessment.observations) ||
    (assessment.confidence !== "low" && assessment.confidence !== "medium" && assessment.confidence !== "high") ||
    typeof assessment.recommendedService !== "string" ||
    (assessment.urgency !== "routine" && assessment.urgency !== "same_day" && assessment.urgency !== "call_now") ||
    !(assessment.safetyCode === null || typeof assessment.safetyCode === "string") ||
    !(assessment.safetyMessage === null || typeof assessment.safetyMessage === "string") ||
    !Array.isArray(assessment.followUpQuestions) ||
    typeof assessment.requiresInspection !== "boolean"
  ) {
    return null;
  }
  if (
    !assessment.observations.every((item) => typeof item === "string") ||
    !assessment.followUpQuestions.every((item) => typeof item === "string")
  ) {
    return null;
  }
  return assessment as Assessment;
}

function urgencyLabel(urgency: Assessment["urgency"]) {
  if (urgency === "call_now") return "Call now";
  if (urgency === "same_day") return "Same-day call";
  return "Routine appointment";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
