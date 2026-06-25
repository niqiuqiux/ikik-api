package domain

import "testing"

func TestDefaultAntigravityModelMapping_IncludesImageCompatibilityAliases(t *testing.T) {
	t.Parallel()

	expected := map[string]string{
		"gemini-2.5-flash-image":         "gemini-2.5-flash-image",
		"gemini-2.5-flash-image-preview": "gemini-2.5-flash-image",
		"gemini-3.1-flash-image":         "gemini-3.1-flash-image",
		"gemini-3.1-flash-image-preview": "gemini-3.1-flash-image",
		"gemini-3-pro-image":             "gemini-3.1-flash-image",
		"gemini-3-pro-image-preview":     "gemini-3.1-flash-image",
	}

	for model, want := range expected {
		if got, ok := DefaultAntigravityModelMapping[model]; !ok || got != want {
			t.Fatalf("expected image generation model %q to map to %q, got %q (present=%v)", model, want, got, ok)
		}
	}
}
