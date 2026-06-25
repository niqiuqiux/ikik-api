package service

import (
	"context"

	"ikik-api/internal/config"
)

func upstreamAllowlistHosts(ctx context.Context, cfg *config.Config, settingService *SettingService) ([]string, error) {
	if cfg == nil {
		return nil, nil
	}
	if settingService == nil {
		return cfg.Security.URLAllowlist.UpstreamHosts, nil
	}
	return settingService.GetUpstreamURLAllowlistHosts(ctx)
}
