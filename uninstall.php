<?php
/**
 * Lipishilpo Pro uninstall — remove Pro-only options.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'lipishilpo_openai_key' );
delete_option( 'lipishilpo_openai_model' );
delete_option( 'lipishilpo_ai_provider' );
delete_option( 'lipishilpo_ai_key' );
delete_option( 'lipishilpo_ai_model' );
delete_option( 'lipishilpo_ai_custom_model' );
delete_option( 'lipishilpo_ai_base_url' );
delete_option( 'lipishilpo_license_key' );
delete_option( 'lipishilpo_license_status' );
