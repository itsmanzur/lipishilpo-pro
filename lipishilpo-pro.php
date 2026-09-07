<?php
/**
 * Plugin Name: Lipishilpo Pro
 * Plugin URI:  https://lipishilpo.com/pro
 * Description: Premium add-on for Lipishilpo — OpenAI AI editorial intelligence, story and character tracking, and DOCX, PDF, EPUB book formatting.
 * Version:     1.0.0
 * Author:      Lipishilpo Team
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: lipishilpo-pro
 * Domain Path: /languages
 * Requires Plugins: lipishilpo
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'LIPISHILPO_PRO_VERSION', '1.0.0' );
define( 'LIPISHILPO_PRO_FILE', __FILE__ );
define( 'LIPISHILPO_PRO_DIR', plugin_dir_path( __FILE__ ) );
define( 'LIPISHILPO_PRO_URL', plugin_dir_url( __FILE__ ) );

/**
 * Dependency Check: Ensure core Free plugin 'Lipishilpo' is active.
 */
add_action( 'plugins_loaded', 'lipishilpo_pro_bootstrap', 20 );

function lipishilpo_pro_bootstrap() {
	if ( ! defined( 'LIPISHILPO_VERSION' ) ) {
		add_action( 'admin_notices', 'lipishilpo_pro_missing_parent_notice' );
		return;
	}

	load_plugin_textdomain( 'lipishilpo-pro', false, dirname( plugin_basename( LIPISHILPO_PRO_FILE ) ) . '/languages' );

	add_filter( 'lipishilpo_is_pro', 'lipishilpo_pro_is_licensed' );

	add_filter( 'lipishilpo_fonts_url', 'lipishilpo_pro_fonts_url' );

	// 3. Load Pro classes
	require_once LIPISHILPO_PRO_DIR . 'includes/class-pro-admin.php';
	require_once LIPISHILPO_PRO_DIR . 'includes/class-pro-analyze.php';
	require_once LIPISHILPO_PRO_DIR . 'includes/class-pro-export.php';

	Lipishilpo_Pro_Admin::init();
	Lipishilpo_Pro_Analyze::init();
	Lipishilpo_Pro_Export::init();

	add_action( 'lipishilpo_enqueue_assets', 'lipishilpo_pro_enqueue_assets' );
}

function lipishilpo_pro_enqueue_assets() {
	$asset_file = LIPISHILPO_PRO_DIR . 'assets/js/lipishilpo-pro-editor.asset.php';
	$asset      = file_exists( $asset_file )
		? require $asset_file
		: array(
			'dependencies' => array(),
			'version'      => LIPISHILPO_PRO_VERSION,
		);

	if ( file_exists( LIPISHILPO_PRO_DIR . 'assets/js/main.css' ) ) {
		wp_enqueue_style(
			'lipishilpo-pro-editor',
			LIPISHILPO_PRO_URL . 'assets/js/main.css',
			array(),
			$asset['version']
		);
	}

	wp_enqueue_script(
		'lipishilpo-pro-editor',
		LIPISHILPO_PRO_URL . 'assets/js/lipishilpo-pro-editor.js',
		$asset['dependencies'],
		$asset['version'],
		true
	);
}

/**
 * Admin notice if parent Free plugin is missing or inactive
 */
function lipishilpo_pro_missing_parent_notice() {
	?>
	<div class="notice notice-error is-dismissible">
		<p>
			<strong><?php esc_html_e( 'Lipishilpo Pro:', 'lipishilpo-pro' ); ?></strong>
			<?php esc_html_e( 'This add-on requires the core "Lipishilpo" plugin to be installed and activated.', 'lipishilpo-pro' ); ?>
		</p>
	</div>
	<?php
}

/**
 * Local license gate: a non-empty saved key marked valid unlocks Pro.
 */
function lipishilpo_pro_is_licensed( $is_pro = false ) {
	$key    = trim( (string) get_option( 'lipishilpo_license_key', '' ) );
	$status = (string) get_option( 'lipishilpo_license_status', '' );

	if ( $key !== '' && $status !== 'valid' ) {
		update_option( 'lipishilpo_license_status', 'valid' );
		$status = 'valid';
	}

	return $key !== '' && $status === 'valid';
}

function lipishilpo_pro_fonts_url( $url ) {
	$regular = LIPISHILPO_PRO_DIR . 'assets/fonts/NotoSerifBengali-Regular.ttf';
	if ( file_exists( $regular ) ) {
		return LIPISHILPO_PRO_URL . 'assets/fonts';
	}
	return $url;
}
