<?php
/**
 * Export REST API — Lipishilpo Pro
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
				'permission_callback' => array( 'Lipishilpo_Projects', 'require_writer' ),
			)
		);
	}

	public static function status( $request ) {
		$licensed = function_exists( 'lipishilpo_is_pro' ) && lipishilpo_is_pro();
		$fonts    = file_exists( LIPISHILPO_PRO_DIR . 'assets/fonts/NotoSerifBengali-Regular.ttf' );

		return rest_ensure_response(
			array(
				'pro'  => $licensed,
				'docx' => $licensed,
				'pdf'  => $licensed && $fonts,
				'epub' => $licensed && $fonts,
				'txt'  => true,
			)
		);
	}
}
