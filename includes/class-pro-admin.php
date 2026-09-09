<?php
/**
 * Pro Admin Settings — Lipishilpo Pro
 *
 * Universal Multi-Provider AI (OpenAI, Gemini, Claude, OpenRouter, Custom)
 * and Pro license key management.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Lipishilpo_Pro_Admin {

	public static function init() {
		add_action( 'lipishilpo_register_admin_settings', array( __CLASS__, 'register_settings' ) );
		add_action( 'lipishilpo_admin_settings_bottom', array( __CLASS__, 'render_bottom_tools' ) );
	}

	public static function get_providers() {
		return array(
			'openai'     => array(
				'name'            => 'OpenAI',
				'doc_url'         => 'https://platform.openai.com/api-keys',
				'doc_text'        => 'platform.openai.com',
				'key_placeholder' => 'sk-proj-...',
				'default_model'   => 'gpt-4o-mini',
				'has_base_url'    => false,
				'models'          => array(
					'gpt-4o-mini' => 'GPT-4o Mini (Cost-effective, Fast — Recommended)',
					'gpt-4o'      => 'GPT-4o (Deep Literary Analysis)',
					'o3-mini'     => 'o3-mini (Advanced Reasoning)',
					'o4-mini'     => 'o4-mini (High-speed Reasoning)',
					'custom'      => 'Custom Model Name (Specify below)',
				),
			),
			'gemini'     => array(
				'name'            => 'Google Gemini',
				'doc_url'         => 'https://aistudio.google.com/app/apikey',
				'doc_text'        => 'aistudio.google.com',
				'key_placeholder' => 'AIzaSy...',
				'default_model'   => 'gemini-2.5-flash',
				'has_base_url'    => false,
				'models'          => array(
					'gemini-2.5-flash' => 'Gemini 2.5 Flash (Fast, Highly Intelligent — Recommended)',
					'gemini-2.0-flash' => 'Gemini 2.0 Flash (Ultra Fast & Responsive)',
					'gemini-1.5-flash' => 'Gemini 1.5 Flash (Lightweight & Economical)',
					'gemini-1.5-pro'   => 'Gemini 1.5 Pro (Deep Nuance & Large Context)',
					'custom'           => 'Custom Model Name (Specify below)',
				),
			),
			'claude'     => array(
				'name'            => 'Anthropic Claude',
				'doc_url'         => 'https://console.anthropic.com/settings/keys',
				'doc_text'        => 'console.anthropic.com',
				'key_placeholder' => 'sk-ant-api...',
				'default_model'   => 'claude-3-7-sonnet-20250219',
				'has_base_url'    => false,
				'models'          => array(
					'claude-3-7-sonnet-20250219' => 'Claude 3.7 Sonnet (Hybrid Reasoning & Top Literary Quality)',
					'claude-3-5-sonnet-20241022' => 'Claude 3.5 Sonnet (State of the art literary polish)',
					'claude-3-5-haiku-20241022'  => 'Claude 3.5 Haiku (Fast & Responsive)',
					'custom'                     => 'Custom Model Name (Specify below)',
				),
			),
			'openrouter' => array(
				'name'            => 'OpenRouter (DeepSeek, Llama, Mistral & more)',
				'doc_url'         => 'https://openrouter.ai/keys',
				'doc_text'        => 'openrouter.ai',
				'key_placeholder' => 'sk-or-v1-...',
				'default_model'   => 'deepseek/deepseek-chat',
				'has_base_url'    => false,
				'models'          => array(
					'deepseek/deepseek-chat'             => 'DeepSeek V3 (High performance, ultra low cost)',
					'deepseek/deepseek-r1'               => 'DeepSeek R1 (Advanced Deep Reasoning)',
					'meta-llama/llama-3.3-70b-instruct' => 'Meta Llama 3.3 70B Instruct',
					'mistralai/mistral-large-2411'       => 'Mistral Large 2411',
					'openai/gpt-4o-mini'                 => 'OpenAI GPT-4o Mini (via OpenRouter)',
					'anthropic/claude-3.5-sonnet'        => 'Anthropic Claude 3.5 Sonnet (via OpenRouter)',
					'google/gemini-2.0-flash-001'        => 'Google Gemini 2.0 Flash (via OpenRouter)',
					'custom'                             => 'Custom Model Name (Specify below)',
				),
			),
			'custom'     => array(
				'name'            => 'Custom / OpenAI-Compatible (DeepSeek, Groq, Ollama, Local)',
				'doc_url'         => '',
				'doc_text'        => '',
				'key_placeholder' => 'sk-... or API token (leave blank if local without auth)',
				'default_model'   => 'custom',
				'has_base_url'    => true,
				'models'          => array(
					'custom' => 'Custom Model (Specify below)',
				),
			),
		);
	}

	public static function register_settings() {
		// AI Provider Setting
		register_setting(
			'lipishilpo_settings',
			'lipishilpo_ai_provider',
			array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => 'openai',
			)
		);

		// AI API Key Setting (universal)
		register_setting(
			'lipishilpo_settings',
			'lipishilpo_ai_key',
			array(
				'type'              => 'string',
				'sanitize_callback' => array( __CLASS__, 'sanitize_ai_key' ),
				'default'           => '',
			)
		);

		// AI Model Setting
		register_setting(
			'lipishilpo_settings',
			'lipishilpo_ai_model',
			array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => 'gpt-4o-mini',
			)
		);

		// AI Custom Model Name
		register_setting(
			'lipishilpo_settings',
			'lipishilpo_ai_custom_model',
			array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			)
		);

		// AI Custom Base URL
		register_setting(
			'lipishilpo_settings',
			'lipishilpo_ai_base_url',
			array(
				'type'              => 'string',
				'sanitize_callback' => 'esc_url_raw',
				'default'           => '',
			)
		);

		// Pro License Key
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
			__( 'Universal AI Connectivity Settings (Pro)', 'lipishilpo-pro' ),
			array( __CLASS__, 'render_ai_section' ),
			'lipishilpo-settings'
		);

		add_settings_section(
			'lipishilpo_pro_license_section',
			__( 'Pro License Settings', 'lipishilpo-pro' ),
			array( __CLASS__, 'render_license_section' ),
			'lipishilpo-settings'
		);

		// Provider field
		add_settings_field(
			'lipishilpo_ai_provider',
			__( 'AI Provider', 'lipishilpo-pro' ),
			array( __CLASS__, 'render_provider_field' ),
			'lipishilpo-settings',
			'lipishilpo_ai_section'
		);

		// API Key field
		add_settings_field(
			'lipishilpo_ai_key',
			__( 'API Key', 'lipishilpo-pro' ),
			array( __CLASS__, 'render_ai_key_field' ),
			'lipishilpo-settings',
			'lipishilpo_ai_section'
		);

		// Base URL field
		add_settings_field(
			'lipishilpo_ai_base_url',
			__( 'Custom Endpoint URL', 'lipishilpo-pro' ),
			array( __CLASS__, 'render_base_url_field' ),
			'lipishilpo-settings',
			'lipishilpo_ai_section'
		);

		// Model field
		add_settings_field(
			'lipishilpo_ai_model',
			__( 'AI Model', 'lipishilpo-pro' ),
			array( __CLASS__, 'render_ai_model_field' ),
			'lipishilpo-settings',
			'lipishilpo_ai_section'
		);

		// Custom Model field
		add_settings_field(
			'lipishilpo_ai_custom_model',
			__( 'Custom Model Name', 'lipishilpo-pro' ),
			array( __CLASS__, 'render_custom_model_field' ),
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
		echo '<p>' . esc_html__( 'Connect your preferred AI provider (OpenAI, Google Gemini, Anthropic Claude, OpenRouter, or Custom/Local AI). API keys are stored securely on your local server and power the editorial assistant, story continuity, and character tracking.', 'lipishilpo-pro' ) . '</p>';
	}

	public static function render_license_section() {
		echo '<p>' . esc_html__( 'Enter your Lipishilpo Pro license key to activate updates and premium features.', 'lipishilpo-pro' ) . '</p>';
	}

	public static function sanitize_ai_key( $value ) {
		$value = sanitize_text_field( $value );
		if ( $value === '' ) {
			// Keep existing key if blank was submitted
			$current = (string) get_option( 'lipishilpo_ai_key', '' );
			if ( $current === '' ) {
				$current = (string) get_option( 'lipishilpo_openai_key', '' );
			}
			return $current;
		}
		// Also update legacy option for full backward compatibility
		update_option( 'lipishilpo_openai_key', $value );
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

	public static function render_provider_field() {
		$provider  = get_option( 'lipishilpo_ai_provider', 'openai' );
		$providers = self::get_providers();
		?>
		<select id="lipishilpo_ai_provider" name="lipishilpo_ai_provider" style="min-width: 320px; font-weight: 500;">
			<?php foreach ( $providers as $key => $data ) : ?>
				<option value="<?php echo esc_attr( $key ); ?>" <?php selected( $provider, $key ); ?>>
					<?php echo esc_html( $data['name'] ); ?>
				</option>
			<?php endforeach; ?>
		</select>
		<p class="description">
			<?php esc_html_e( 'Select the AI provider you wish to use for editorial analysis and proofreading.', 'lipishilpo-pro' ); ?>
		</p>
		<?php
	}

	public static function render_ai_key_field() {
		$provider  = get_option( 'lipishilpo_ai_provider', 'openai' );
		$providers = self::get_providers();
		$info      = isset( $providers[ $provider ] ) ? $providers[ $provider ] : $providers['openai'];

		$value = get_option( 'lipishilpo_ai_key', '' );
		if ( empty( $value ) ) {
			$value = get_option( 'lipishilpo_openai_key', '' );
		}
		$masked = $value ? substr( $value, 0, 8 ) . str_repeat( '•', 18 ) : '';
		?>
		<input
			type="password"
			id="lipishilpo_ai_key"
			name="lipishilpo_ai_key"
			value=""
			class="regular-text"
			placeholder="<?php echo $value ? esc_attr__( 'Leave blank to keep current saved key', 'lipishilpo-pro' ) : esc_attr( $info['key_placeholder'] ); ?>"
			autocomplete="new-password"
		/>
		<?php if ( $masked ) : ?>
			<p class="description" id="lipishilpo_current_key_display">
				<?php esc_html_e( 'Current saved key:', 'lipishilpo-pro' ); ?>
				<code><?php echo esc_html( $masked ); ?></code>
			</p>
		<?php endif; ?>
		<p class="description" id="lipishilpo_key_help_text">
			<span id="lipishilpo_key_guide_text">
				<?php
				if ( ! empty( $info['doc_url'] ) ) {
					printf(
						/* translators: 1: Provider name, 2: Provider URL */
						esc_html__( 'Obtain your %1$s API key from %2$s.', 'lipishilpo-pro' ),
						esc_html( $info['name'] ),
						'<a id="lipishilpo_key_link" href="' . esc_url( $info['doc_url'] ) . '" target="_blank" rel="noopener">' . esc_html( $info['doc_text'] ) . '</a>'
					);
				} else {
					esc_html_e( 'Enter your endpoint authentication token or API key (if required).', 'lipishilpo-pro' );
				}
				?>
			</span>
		</p>
		<?php
	}

	public static function render_base_url_field() {
		$provider = get_option( 'lipishilpo_ai_provider', 'openai' );
		$value    = get_option( 'lipishilpo_ai_base_url', '' );
		?>
		<div id="lipishilpo_base_url_row">
			<input
				type="url"
				id="lipishilpo_ai_base_url"
				name="lipishilpo_ai_base_url"
				value="<?php echo esc_attr( $value ); ?>"
				class="regular-text"
				placeholder="https://api.deepseek.com/chat/completions or http://localhost:11434/v1/chat/completions"
			/>
			<p class="description">
				<?php esc_html_e( 'Specify the complete chat completions endpoint URL for Custom / Local / Proxy AI.', 'lipishilpo-pro' ); ?>
			</p>
		</div>
		<?php
	}

	public static function render_ai_model_field() {
		$provider  = get_option( 'lipishilpo_ai_provider', 'openai' );
		$providers = self::get_providers();
		$info      = isset( $providers[ $provider ] ) ? $providers[ $provider ] : $providers['openai'];

		$value = get_option( 'lipishilpo_ai_model', '' );
		if ( empty( $value ) ) {
			$value = get_option( 'lipishilpo_openai_model', 'gpt-4o-mini' );
		}
		?>
		<select id="lipishilpo_ai_model" name="lipishilpo_ai_model" style="min-width: 320px;">
			<?php foreach ( $info['models'] as $key => $label ) : ?>
				<option value="<?php echo esc_attr( $key ); ?>" <?php selected( $value, $key ); ?>>
					<?php echo esc_html( $label ); ?>
				</option>
			<?php endforeach; ?>
		</select>
		<p class="description">
			<?php esc_html_e( 'Select the AI model optimized for literary nuance, proofreading, and reasoning.', 'lipishilpo-pro' ); ?>
		</p>
		<?php
	}

	public static function render_custom_model_field() {
		$value = get_option( 'lipishilpo_ai_custom_model', '' );
		?>
		<div id="lipishilpo_custom_model_row">
			<input
				type="text"
				id="lipishilpo_ai_custom_model"
				name="lipishilpo_ai_custom_model"
				value="<?php echo esc_attr( $value ); ?>"
				class="regular-text"
				placeholder="e.g., deepseek-chat, mistral-large-latest, llama3.3:70b"
			/>
			<p class="description">
				<?php esc_html_e( 'Enter the exact model identifier if selecting a custom model or using an external endpoint.', 'lipishilpo-pro' ); ?>
			</p>
		</div>
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
		$providers = self::get_providers();
		?>
		<div class="card" style="max-width: 800px; margin-top: 25px; padding: 20px 24px;">
			<h2 style="margin-top: 0; display: flex; align-items: center; gap: 8px;">
				<span>⚡</span>
				<?php esc_html_e( 'Universal AI Connection Test', 'lipishilpo-pro' ); ?>
			</h2>
			<p>
				<?php esc_html_e( 'Verify server-to-server connectivity with your active AI provider before running editorial analysis:', 'lipishilpo-pro' ); ?>
			</p>
			<button id="lipishilpo-test-api" class="button button-secondary" type="button">
				<?php esc_html_e( 'Test Connection', 'lipishilpo-pro' ); ?>
			</button>
			<span id="lipishilpo-test-result" style="margin-left: 12px; font-weight: 500;"></span>

			<script>
			(function() {
				const providersData = <?php echo wp_json_encode( $providers ); ?>;
				const providerSelect = document.getElementById('lipishilpo_ai_provider');
				const modelSelect = document.getElementById('lipishilpo_ai_model');
				const keyInput = document.getElementById('lipishilpo_ai_key');
				const keyGuide = document.getElementById('lipishilpo_key_guide_text');
				const baseUrlRow = document.getElementById('lipishilpo_base_url_row');
				const customModelRow = document.getElementById('lipishilpo_custom_model_row');

				function updateUI() {
					if (!providerSelect || !modelSelect) return;
					const selectedProvider = providerSelect.value;
					const info = providersData[selectedProvider] || providersData['openai'];

					// 1. Update Base URL visibility
					const baseUrlParent = baseUrlRow ? baseUrlRow.closest('tr') : null;
					if (baseUrlParent) {
						baseUrlParent.style.display = info.has_base_url ? '' : 'none';
					}

					// 2. Update Model select options
					const currentVal = modelSelect.value;
					modelSelect.innerHTML = '';
					let hasMatch = false;

					for (const [mKey, mLabel] of Object.entries(info.models)) {
						const opt = document.createElement('option');
						opt.value = mKey;
						opt.textContent = mLabel;
						if (mKey === currentVal) {
							opt.selected = true;
							hasMatch = true;
						}
						modelSelect.appendChild(opt);
					}

					if (!hasMatch && info.default_model) {
						modelSelect.value = info.default_model;
					}

					// 3. Update Custom Model visibility
					updateCustomModelVisibility();

					// 4. Update Key Placeholder and Guide
					if (keyInput && !keyInput.value) {
						keyInput.placeholder = info.key_placeholder || 'sk-...';
					}

					if (keyGuide) {
						if (info.doc_url) {
							keyGuide.innerHTML = 'Obtain your ' + info.name + ' API key from <a href="' + info.doc_url + '" target="_blank" rel="noopener">' + info.doc_text + '</a>.';
						} else {
							keyGuide.textContent = 'Enter your endpoint authentication token or API key (if required).';
						}
					}
				}

				function updateCustomModelVisibility() {
					const customParent = customModelRow ? customModelRow.closest('tr') : null;
					if (customParent && modelSelect) {
						customParent.style.display = (modelSelect.value === 'custom') ? '' : 'none';
					}
				}

				if (providerSelect) {
					providerSelect.addEventListener('change', updateUI);
				}
				if (modelSelect) {
					modelSelect.addEventListener('change', updateCustomModelVisibility);
				}

				// Initial run
				updateUI();

				// Connection Test
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
							const provName = (data.provider || '').toUpperCase();
							result.textContent = '✅ ' + provName + ' connection successful! Active model: ' + (data.model || '');
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
			})();
			</script>
		</div>
		<?php
	}
}
