<?php
/**
 * Export REST API — Lipishilpo Pro
 *
 * Provides DOCX, PDF, and EPUB export capabilities and Pro status.
 *
 * Endpoint:
 *   GET /wp-json/lipishilpo/v1/export/status
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Lipishilpo_Pro_Export {

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	public static function register_routes() {
		register_rest_route(
			LIPISHILPO_REST_NAMESPACE,
			'/export/status',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'status' ),
				'permission_callback' => array( 'Lipishilpo_Projects', 'require_login' ),
			)
		);
	}

	public static function status( $request ) {
		return rest_ensure_response( array(
			'pro'  => true,
			'docx' => true,
			'pdf'  => true,
			'epub' => true,
			'txt'  => true,
		) );
	}
}
