<?php
/**
 * Pro Admin Settings — Lipishilpo Pro
 *
 * OpenAI API Key, AI model selection, and Pro license key management.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Lipishilpo_Pro_Admin {

	public static function init() {
		add_action( 'lipishilpo_register_admin_settings', array( __CLASS__, 'register_settings' ) );
		add_action( 'lipishilpo_admin_settings_bottom', array( __CLASS__, 'render_bottom_tools' ) );
	}

	public static function register_settings() {
		register_setting(
			'lipishilpo_settings',
			'lipishilpo_openai_key',
			array(
				'type'              => 'string',
				'sanitize_callback' => array( __CLASS__, 'sanitize_openai_key' ),
				'default'           => '',
			)
		);

		register_setting(
			'lipishilpo_settings',
			'lipishilpo_openai_model',
			array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => 'gpt-4o-mini',
			)
		);

		register_setting(
			'lipishilpo_settings',
			'lipishilpo_license_key',
			array(
				'type'              => 'string',
				'sanitize_callback' => array( __CLASS__, 'sanitize_license_key' ),
				'default'           => '',
			)
		);

		// Settings Sections
		add_settings_section(
			'lipishilpo_ai_section',
			__( 'AI Connectivity Settings (Pro)', 'lipishilpo-pro' ),
			array( __CLASS__, 'render_ai_section' ),
			'lipishilpo-settings'
		);

		add_settings_section(
			'lipishilpo_pro_license_section',
			__( 'Pro License Settings', 'lipishilpo-pro' ),
			array( __CLASS__, 'render_license_section' ),
			'lipishilpo-settings'
		);

		// OpenAI Key field
		add_settings_field(
			'lipishilpo_openai_key',
			__( 'OpenAI API Key', 'lipishilpo-pro' ),
			array( __CLASS__, 'render_openai_key_field' ),
			'lipishilpo-settings',
			'lipishilpo_ai_section'
		);

		// OpenAI Model field
		add_settings_field(
			'lipishilpo_openai_model',
			__( 'AI Model', 'lipishilpo-pro' ),
			array( __CLASS__, 'render_openai_model_field' ),
			'lipishilpo-settings',
			'lipishilpo_ai_section'
		);

		// License Key field
		add_settings_field(
			'lipishilpo_license_key',
			__( 'Pro License Key', 'lipishilpo-pro' ),
			array( __CLASS__, 'render_license_field' ),
			'lipishilpo-settings',
			'lipishilpo_pro_license_section'
		);
	}

	public static function render_ai_section() {
		echo '<p>' . esc_html__( 'Your OpenAI API key is securely stored on your server and powers the AI editorial assistant and character tracking tools.', 'lipishilpo-pro' ) . '</p>';
	}

	public static function render_license_section() {
		echo '<p>' . esc_html__( 'Enter your Lipishilpo Pro license key to activate updates and premium features.', 'lipishilpo-pro' ) . '</p>';
	}

	public static function sanitize_openai_key( $value ) {
		$value = sanitize_text_field( $value );
		if ( $value === '' ) {
			return (string) get_option( 'lipishilpo_openai_key', '' );
		}
		return $value;
	}

	public static function sanitize_license_key( $value ) {
		$value = sanitize_text_field( $value );
		if ( $value === '' ) {
			update_option( 'lipishilpo_license_status', 'inactive' );
			return '';
		}
		update_option( 'lipishilpo_license_status', 'valid' );
		return $value;
	}

	public static function render_openai_key_field() {
		$value  = get_option( 'lipishilpo_openai_key', '' );
		$masked = $value ? substr( $value, 0, 8 ) . str_repeat( '•', 20 ) : '';
		?>
		<input
			type="password"
			id="lipishilpo_openai_key"
			name="lipishilpo_openai_key"
			value=""
			class="regular-text"
			placeholder="<?php echo $value ? esc_attr__( 'Leave blank to keep the saved key', 'lipishilpo-pro' ) : 'sk-...'; ?>"
			autocomplete="new-password"
		/>
		<?php if ( $masked ) : ?>
			<p class="description">
				<?php esc_html_e( 'Current key:', 'lipishilpo-pro' ); ?>
				<code><?php echo esc_html( $masked ); ?></code>
			</p>
		<?php endif; ?>
		<p class="description">
			<?php
			printf(
				/* translators: %s: OpenAI platform URL */
				esc_html__( 'Obtain your API key from %s.', 'lipishilpo-pro' ),
				'<a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com</a>'
			);
			?>
		</p>
		<?php
	}

	public static function render_openai_model_field() {
		$value  = get_option( 'lipishilpo_openai_model', 'gpt-4o-mini' );
		$models = array(
			'gpt-4o-mini' => 'GPT-4o Mini (Cost-effective, Fast — Recommended)',
			'gpt-4o'      => 'GPT-4o (Deep Literary Analysis)',
			'o4-mini'     => 'o4-mini (Advanced Reasoning & Logic)',
		);
		?>
		<select id="lipishilpo_openai_model" name="lipishilpo_openai_model">
			<?php foreach ( $models as $key => $label ) : ?>
				<option value="<?php echo esc_attr( $key ); ?>" <?php selected( $value, $key ); ?>>
					<?php echo esc_html( $label ); ?>
				</option>
			<?php endforeach; ?>
		</select>
		<?php
	}

	public static function render_license_field() {
		$value  = get_option( 'lipishilpo_license_key', '' );
		$status = get_option( 'lipishilpo_license_status', '' );
		?>
		<input
			type="password"
			id="lipishilpo_license_key"
			name="lipishilpo_license_key"
			value="<?php echo esc_attr( $value ); ?>"
			class="regular-text"
			placeholder="LPS-XXXX-XXXX-XXXX"
			autocomplete="off"
		/>
		<p class="description">
			<?php
			if ( $value && $status === 'valid' ) {
				esc_html_e( 'License key is saved and Pro features are unlocked.', 'lipishilpo-pro' );
			} else {
				esc_html_e( 'Enter the Pro license key obtained from lipishilpo.com. Features stay locked until a key is saved.', 'lipishilpo-pro' );
			}
			?>
		</p>
		<?php
	}

	public static function render_bottom_tools() {
		?>
		<div class="card" style="max-width: 800px; margin-top: 25px; padding: 20px 24px;">
			<h2 style="margin-top: 0;"><?php esc_html_e( '⚡ AI Connection Test', 'lipishilpo-pro' ); ?></h2>
			<p>
				<?php esc_html_e( 'After saving your OpenAI API key, click below to verify server connectivity:', 'lipishilpo-pro' ); ?>
			</p>
			<button id="lipishilpo-test-api" class="button button-secondary" type="button">
				<?php esc_html_e( 'Test Connection', 'lipishilpo-pro' ); ?>
			</button>
			<span id="lipishilpo-test-result" style="margin-left: 12px; font-weight: 500;"></span>

			<script>
			document.getElementById('lipishilpo-test-api')?.addEventListener('click', async function() {
				const btn = this;
				const result = document.getElementById('lipishilpo-test-result');
				btn.disabled = true;
				result.textContent = 'Testing connection…';
				result.style.color = '#666';
				try {
					const resp = await fetch('<?php echo esc_url( get_rest_url( null, 'lipishilpo/v1/analyze/test' ) ); ?>', {
						method: 'POST',
						headers: { 'X-WP-Nonce': '<?php echo esc_js( wp_create_nonce( 'wp_rest' ) ); ?>' }
					});
					const data = await resp.json();
					if (data.ok) {
						result.textContent = '✅ Connection successful! Active model: ' + (data.model || '');
						result.style.color = '#155724';
					} else {
						result.textContent = '❌ ' + (data.message || 'API key is not configured or invalid.');
						result.style.color = '#721c24';
					}
				} catch (e) {
					result.textContent = '❌ Connection test failed.';
					result.style.color = '#721c24';
				} finally {
					btn.disabled = false;
				}
			});
			</script>
		</div>
		<?php
	}
}
