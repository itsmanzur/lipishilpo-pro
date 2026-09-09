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
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_pro_admin_assets' ) );
	}

	public static function enqueue_pro_admin_assets( $hook ) {
		if ( false === strpos( $hook, 'lipishilpo' ) ) {
			return;
		}

		$css_file = LIPISHILPO_PRO_DIR . 'assets/css/lipishilpo-pro-admin.css';
		if ( file_exists( $css_file ) ) {
			wp_enqueue_style(
				'lipishilpo-pro-admin-style',
				LIPISHILPO_PRO_URL . 'assets/css/lipishilpo-pro-admin.css',
				array(),
				LIPISHILPO_PRO_VERSION
			);
		}
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

		// Section: Universal AI Settings
		add_settings_section(
			'lipishilpo_ai_section',
			__( 'Universal AI Connectivity Settings (Pro)', 'lipishilpo-pro' ),
			array( __CLASS__, 'render_ai_section' ),
			'lipishilpo-settings'
		);

		// Section: Pro License Settings
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
		?>
		<div class="lipishilpo-section-intro">
			<p class="lipishilpo-card-subtitle">
				<?php esc_html_e( 'আপনার পছন্দের AI প্রোভাইডার (OpenAI, Google Gemini, Anthropic Claude, OpenRouter বা Custom/Local AI) যুক্ত করুন। API Key সার্ভারের wp_options টেবিলে সম্পূর্ণ এনক্রিপ্টেড ও সুরক্ষিত থাকে।', 'lipishilpo-pro' ); ?>
			</p>
		</div>
		<?php
	}

	public static function render_license_section() {
		?>
		<div class="lipishilpo-section-intro" style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9;">
			<div class="lipishilpo-card-header" style="margin-bottom: 8px;">
				<div class="lipishilpo-card-header-icon" style="background: #eff6ff; color: #1d4ed8; border-color: #dbeafe;">🔑</div>
				<h2 class="lipishilpo-card-title"><?php esc_html_e( 'লিপিশিল্প প্রো লাইসেন্স ও অটো-আপডেট', 'lipishilpo-pro' ); ?></h2>
			</div>
			<p class="lipishilpo-card-subtitle">
				<?php esc_html_e( 'lipishilpo.com থেকে প্রাপ্ত প্রো লাইসেন্স কি প্রবেশ করিয়ে সমস্ত প্রিমিয়াম ফিচার সক্রিয় রাখুন।', 'lipishilpo-pro' ); ?>
			</p>
		</div>
		<?php
	}

	public static function sanitize_ai_key( $value ) {
		$value = sanitize_text_field( $value );
		if ( $value === '' ) {
			$current = (string) get_option( 'lipishilpo_ai_key', '' );
			if ( $current === '' ) {
				$current = (string) get_option( 'lipishilpo_openai_key', '' );
			}
			return $current;
		}
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
		<select id="lipishilpo_ai_provider" name="lipishilpo_ai_provider" style="min-width: 320px; font-weight: 600;">
			<?php foreach ( $providers as $key => $data ) : ?>
				<option value="<?php echo esc_attr( $key ); ?>" <?php selected( $provider, $key ); ?>>
					<?php echo esc_html( $data['name'] ); ?>
				</option>
			<?php endforeach; ?>
		</select>
		<p class="description">
			<?php esc_html_e( 'সাহিত্যিক প্রুফরিড ও চ্যাপ্টার বিশ্লেষণের জন্য পছন্দের AI প্রোভাইডার নির্বাচন করুন।', 'lipishilpo-pro' ); ?>
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
		<div style="position: relative; max-width: 480px;">
			<input
				type="password"
				id="lipishilpo_ai_key"
				name="lipishilpo_ai_key"
				value=""
				class="regular-text"
				placeholder="<?php echo $value ? esc_attr__( 'বর্তমান সংরক্ষিত কি অপরিবর্তিত রাখতে ফাঁকা রাখুন', 'lipishilpo-pro' ) : esc_attr( $info['key_placeholder'] ); ?>"
				autocomplete="new-password"
			/>
		</div>
		<?php if ( $masked ) : ?>
			<p class="description" id="lipishilpo_current_key_display">
				<?php esc_html_e( 'বর্তমান সংরক্ষিত কি:', 'lipishilpo-pro' ); ?>
				<code><?php echo esc_html( $masked ); ?></code>
			</p>
		<?php endif; ?>
		<p class="description" id="lipishilpo_key_help_text">
			<span id="lipishilpo_key_guide_text">
				<?php
				if ( ! empty( $info['doc_url'] ) ) {
					printf(
						/* translators: 1: Provider name, 2: Provider URL */
						esc_html__( '%1$s API Key সংগ্রহ করতে %2$s-এ যান।', 'lipishilpo-pro' ),
						esc_html( $info['name'] ),
						'<a id="lipishilpo_key_link" href="' . esc_url( $info['doc_url'] ) . '" target="_blank" rel="noopener">' . esc_html( $info['doc_text'] ) . '</a>'
					);
				} else {
					esc_html_e( 'আপনার এন্ডপয়েন্টের অথেনটিকেশন টোকেন বা এপিআই কি দিন (যদি প্রযোজ্য হয়)।', 'lipishilpo-pro' );
				}
				?>
			</span>
		</p>
		<?php
	}

	public static function render_base_url_field() {
		$value = get_option( 'lipishilpo_ai_base_url', '' );
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
				<?php esc_html_e( 'কাস্টম, লোকাল AI বা নিজস্ব প্রক্সি সার্ভারের সম্পূর্ণ Chat Completions এন্ডপয়েন্ট URL দিন।', 'lipishilpo-pro' ); ?>
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
			<?php esc_html_e( 'বাংলা সাহিত্যের ছন্দ ও জটিল প্লট বিশ্লেষণের জন্য প্রস্তুত মডেল নির্বাচন করুন।', 'lipishilpo-pro' ); ?>
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
				<?php esc_html_e( 'কাস্টম মডেলের সঠিক আইডেন্টিফায়ার বা নাম লিখুন।', 'lipishilpo-pro' ); ?>
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
				esc_html_e( '✅ লাইসেন্স কি সংরক্ষিত এবং সমস্ত প্রো ফিচার আনলক করা রয়েছে।', 'lipishilpo-pro' );
			} else {
				esc_html_e( 'lipishilpo.com থেকে কেনা প্রো লাইসেন্স কি এখানে দিন।', 'lipishilpo-pro' );
			}
			?>
		</p>
		<?php
	}

	public static function render_bottom_tools() {
		$providers = self::get_providers();
		?>
		<div class="lipishilpo-tester-box">
			<div class="lipishilpo-tester-header">
				<div>
					<h3 class="lipishilpo-tester-title">
						<span>⚡</span> <?php esc_html_e( 'রিয়েলটাইম AI কানেকশন চেকার (Connection Tester)', 'lipishilpo-pro' ); ?>
					</h3>
					<p class="description" style="margin-top: 4px;">
						<?php esc_html_e( 'সেটিংস সেভ করার পর নির্বাচিত প্রোভাইডারের সাথে সার্ভার হ্যান্ডশেক যাচাই করুন:', 'lipishilpo-pro' ); ?>
					</p>
				</div>
				<button id="lipishilpo-test-api" class="lipishilpo-test-btn" type="button">
					<span>📡</span> <?php esc_html_e( 'Test Connection', 'lipishilpo-pro' ); ?>
				</button>
			</div>

			<div id="lipishilpo-test-result-container" class="lipishilpo-test-result-box">
				<span id="lipishilpo-test-result"></span>
			</div>

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
							keyGuide.innerHTML = info.name + ' API Key সংগ্রহ করতে <a href="' + info.doc_url + '" target="_blank" rel="noopener">' + info.doc_text + '</a>-এ যান।';
						} else {
							keyGuide.textContent = 'আপনার এন্ডপয়েন্টের অথেনটিকেশন টোকেন বা এপিআই কি দিন (যদি প্রযোজ্য হয়)।';
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
					const box = document.getElementById('lipishilpo-test-result-container');
					const result = document.getElementById('lipishilpo-test-result');
					if (!box || !result) return;

					btn.disabled = true;
					btn.innerHTML = '<span>⏳</span> ' + '<?php echo esc_js( __( 'যাচাই করা হচ্ছে...', 'lipishilpo-pro' ) ); ?>';
					box.className = 'lipishilpo-test-result-box active loading';
					result.textContent = '📡 সার্ভারের সাথে সংযোগ পরীক্ষা করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন…';

					try {
						const resp = await fetch('<?php echo esc_url( get_rest_url( null, 'lipishilpo/v1/analyze/test' ) ); ?>', {
							method: 'POST',
							headers: { 'X-WP-Nonce': '<?php echo esc_js( wp_create_nonce( 'wp_rest' ) ); ?>' }
						});
						const data = await resp.json();
						if (data.ok) {
							const provName = (data.provider || '').toUpperCase();
							box.className = 'lipishilpo-test-result-box active success';
							result.textContent = '✅ ' + provName + ' সংযোগ সফল! সক্রিয় মডেল: ' + (data.model || '');
						} else {
							box.className = 'lipishilpo-test-result-box active error';
							result.textContent = '❌ ' + (data.message || 'API কি কনফিগার করা হয়নি বা ইনভ্যালিড।');
						}
					} catch (e) {
						box.className = 'lipishilpo-test-result-box active error';
						result.textContent = '❌ সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।';
					} finally {
						btn.disabled = false;
						btn.innerHTML = '<span>📡</span> ' + '<?php echo esc_js( __( 'Test Connection', 'lipishilpo-pro' ) ); ?>';
					}
				});
			})();
			</script>
		</div>
		<?php
	}
}
