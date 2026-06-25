package service

import (
	"testing"
	"time"
)

func TestIsCarpoolAccountSchedulable_IgnoresLocalRateLimitReset(t *testing.T) {
	now := time.Date(2026, 6, 16, 10, 0, 0, 0, time.UTC)
	resetAt := now.Add(72 * time.Hour)

	account := &Account{
		ID:               1,
		Status:           StatusActive,
		Schedulable:      true,
		RateLimitResetAt: &resetAt,
	}

	if !isCarpoolAccountSchedulableAt(account, now) {
		t.Fatal("expected local rate limit reset window to be ignored for carpool scheduling")
	}
}

func TestIsCarpoolAccountSchedulable_RespectsHardUnschedulableState(t *testing.T) {
	now := time.Date(2026, 6, 16, 10, 0, 0, 0, time.UTC)
	until := now.Add(10 * time.Minute)

	account := &Account{
		ID:                      1,
		Status:                  StatusActive,
		Schedulable:             true,
		TempUnschedulableUntil:  &until,
		TempUnschedulableReason: "token refresh cooldown",
	}

	if isCarpoolAccountSchedulableAt(account, now) {
		t.Fatal("expected temporary unschedulable state to still block carpool scheduling")
	}
}
