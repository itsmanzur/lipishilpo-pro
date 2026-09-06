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

	// 1. Declare Pro active to core plugin
	add_filter( 'lipishilpo_is_pro', '__return_true' );

	// 2. Pro font directory filter
	add_filter( 'lipishilpo_fonts_url', function() {
		return LIPISHILPO_PRO_URL . 'assets/fonts';
	} );

	// 3. Load Pro classes
	require_once LIPISHILPO_PRO_DIR . 'includes/class-pro-admin.php';
	require_once LIPISHILPO_PRO_DIR . 'includes/class-pro-analyze.php';
	require_once LIPISHILPO_PRO_DIR . 'includes/class-pro-export.php';

	Lipishilpo_Pro_Admin::init();
	Lipishilpo_Pro_Analyze::init();
	Lipishilpo_Pro_Export::init();
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
