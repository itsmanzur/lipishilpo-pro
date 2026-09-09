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
		add_action( 'lipishilpo_render_admin_pro_cards', array( __CLASS__, 'render_pro_cards' ) );
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

	public static function render_pro_cards() {
		$providers = self::get_providers();
		$provider  = get_option( 'lipishilpo_ai_provider', 'openai' );
		$info      = isset( $providers[ $provider ] ) ? $providers[ $provider ] : $providers['openai'];

		$ai_key = get_option( 'lipishilpo_ai_key', '' );
		if ( empty( $ai_key ) ) {
			$ai_key = get_option( 'lipishilpo_openai_key', '' );
		}
		$masked_key = $ai_key ? substr( $ai_key, 0, 8 ) . str_repeat( '•', 18 ) : '';

		$ai_model = get_option( 'lipishilpo_ai_model', '' );
		if ( empty( $ai_model ) ) {
			$ai_model = get_option( 'lipishilpo_openai_model', 'gpt-4o-mini' );
		}

		$custom_model = get_option( 'lipishilpo_ai_custom_model', '' );
		$base_url     = get_option( 'lipishilpo_ai_base_url', '' );

		$license_key    = get_option( 'lipishilpo_license_key', '' );
		$license_status = get_option( 'lipishilpo_license_status', '' );
		?>

		<!-- Card 1: Universal AI Connectivity Settings -->
		<div class="lipishilpo-card-section">
			<div class="lipishilpo-card-header">
				<div class="lipishilpo-card-header-icon" style="background: #ecfdf5; color: #059669; border-color: #a7f3d0;">🤖</div>
				<div>
					<h2 class="lipishilpo-card-title"><?php esc_html_e( 'ইউনিভার্সাল AI কানেক্টিভিটি ও এডিটোরিয়াল মডেল', 'lipishilpo-pro' ); ?></h2>
					<span class="lipishilpo-card-tag"><?php esc_html_e( 'Universal Multi-Provider Studio Engine', 'lipishilpo-pro' ); ?></span>
				</div>
			</div>
			<p class="lipishilpo-card-subtitle">
				<?php esc_html_e( 'আপনার পছন্দের যেকোনো AI প্রোভাইডার (OpenAI, Google Gemini, Anthropic Claude, OpenRouter বা Custom/Local AI) নির্বাচন করুন। আপনার API Key সার্ভারে সুরক্ষিত থাকে এবং এডিটরের সাহিত্যিক প্রুফরিড ও চরিত্র ধারাবাহিকতা পরিচালনা করে।', 'lipishilpo-pro' ); ?>
			</p>

			<div class="lipishilpo-form-grid">
				<!-- Provider Selector -->
				<div class="lipishilpo-field-group">
					<label for="lipishilpo_ai_provider" class="lipishilpo-field-label">
						<span>🌐</span> <?php esc_html_e( 'AI প্রোভাইডার নির্বাচন (Provider)', 'lipishilpo-pro' ); ?>
					</label>
					<select id="lipishilpo_ai_provider" name="lipishilpo_ai_provider" class="lipishilpo-input-control" style="font-weight: 600;">
						<?php foreach ( $providers as $key => $pdata ) : ?>
							<option value="<?php echo esc_attr( $key ); ?>" <?php selected( $provider, $key ); ?>>
								<?php echo esc_html( $pdata['name'] ); ?>
							</option>
						<?php endforeach; ?>
					</select>
					<p class="lipishilpo-field-help">
						<?php esc_html_e( 'প্রোভাইডার পরিবর্তন করলে নিচের মডেল তালিকা ও নির্দেশিকা স্বয়ংক্রিয়ভাবে আপডেট হবে।', 'lipishilpo-pro' ); ?>
					</p>
				</div>

				<!-- Model Selector -->
				<div class="lipishilpo-field-group">
					<label for="lipishilpo_ai_model" class="lipishilpo-field-label">
						<span>🧠</span> <?php esc_html_e( 'সক্রিয় AI মডেল (Model Selection)', 'lipishilpo-pro' ); ?>
					</label>
					<select id="lipishilpo_ai_model" name="lipishilpo_ai_model" class="lipishilpo-input-control">
						<?php foreach ( $info['models'] as $mkey => $mlabel ) : ?>
							<option value="<?php echo esc_attr( $mkey ); ?>" <?php selected( $ai_model, $mkey ); ?>>
								<?php echo esc_html( $mlabel ); ?>
							</option>
						<?php endforeach; ?>
					</select>
					<p class="lipishilpo-field-help">
						<?php esc_html_e( 'বাংলা সাহিত্যের গভীরতা ও যুক্তি বিশ্লেষণে উপযোগী মডেল নির্বাচন করুন।', 'lipishilpo-pro' ); ?>
					</p>
				</div>
			</div>

			<!-- Custom Model Row (collapsible) -->
			<div id="lipishilpo_custom_model_row" class="lipishilpo-field-group" style="margin-top: 18px; <?php echo ( $ai_model === 'custom' ) ? '' : 'display: none;'; ?>">
				<label for="lipishilpo_ai_custom_model" class="lipishilpo-field-label">
					<span>⚙️</span> <?php esc_html_e( 'কাস্টম মডেলের নাম (Custom Model Identifier)', 'lipishilpo-pro' ); ?>
				</label>
				<input
					type="text"
					id="lipishilpo_ai_custom_model"
					name="lipishilpo_ai_custom_model"
					value="<?php echo esc_attr( $custom_model ); ?>"
					class="lipishilpo-input-control"
					placeholder="e.g., deepseek-chat, mistral-large-latest, llama3.3:70b"
				/>
				<p class="lipishilpo-field-help">
					<?php esc_html_e( 'আপনার এন্ডপয়েন্টের সঠিক মডেল আইডি বা নাম লিখুন।', 'lipishilpo-pro' ); ?>
				</p>
			</div>

			<!-- Custom Base URL Row (collapsible) -->
			<div id="lipishilpo_base_url_row" class="lipishilpo-field-group" style="margin-top: 18px; <?php echo ( ! empty( $info['has_base_url'] ) ) ? '' : 'display: none;'; ?>">
				<label for="lipishilpo_ai_base_url" class="lipishilpo-field-label">
					<span>🔗</span> <?php esc_html_e( 'কাস্টম এন্ডপয়েন্ট URL (Custom Endpoint / Base URL)', 'lipishilpo-pro' ); ?>
				</label>
				<input
					type="url"
					id="lipishilpo_ai_base_url"
					name="lipishilpo_ai_base_url"
					value="<?php echo esc_attr( $base_url ); ?>"
					class="lipishilpo-input-control"
					placeholder="https://api.deepseek.com/chat/completions or http://localhost:11434/v1/chat/completions"
				/>
				<p class="lipishilpo-field-help">
					<?php esc_html_e( 'DeepSeek Direct, Groq, Ollama বা নিজস্ব প্রক্সি সার্ভারের সম্পূর্ণ Chat Completions URL দিন।', 'lipishilpo-pro' ); ?>
				</p>
			</div>

			<!-- API Key Row -->
			<div class="lipishilpo-field-group" style="margin-top: 20px;">
				<label for="lipishilpo_ai_key" class="lipishilpo-field-label">
					<span>🔑</span> <?php esc_html_e( 'প্রোভাইডার API Key (Secret Key)', 'lipishilpo-pro' ); ?>
				</label>
				<div style="position: relative;">
					<input
						type="password"
						id="lipishilpo_ai_key"
						name="lipishilpo_ai_key"
						value=""
						class="lipishilpo-input-control"
						placeholder="<?php echo $ai_key ? esc_attr__( 'বর্তমান সংরক্ষিত কি অপরিবর্তিত রাখতে ফাঁকা রাখুন', 'lipishilpo-pro' ) : esc_attr( $info['key_placeholder'] ); ?>"
						autocomplete="new-password"
					/>
				</div>
				<div class="lipishilpo-key-meta-bar">
					<?php if ( $masked_key ) : ?>
						<span class="lipishilpo-saved-key-pill" id="lipishilpo_current_key_display">
							<span>🔒 সংরক্ষিত কি:</span> <code><?php echo esc_html( $masked_key ); ?></code>
						</span>
					<?php endif; ?>
					<span id="lipishilpo_key_guide_text" class="lipishilpo-key-link-text">
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
				</div>
			</div>

			<!-- Integrated Realtime Connection Tester Box -->
			<div class="lipishilpo-tester-box" style="margin-top: 26px;">
				<div class="lipishilpo-tester-header">
					<div>
						<h3 class="lipishilpo-tester-title">
							<span>⚡</span> <?php esc_html_e( 'রিয়েলটাইম AI সংযোগ পরীক্ষা (Handshake Tester)', 'lipishilpo-pro' ); ?>
						</h3>
						<p class="description" style="margin: 3px 0 0 0;">
							<?php esc_html_e( 'সেটিংস সেভ করার পর নির্বাচিত প্রোভাইডারের সাথে সার্ভার হ্যান্ডশেক ও কানেক্টিভিটি টেস্ট করুন:', 'lipishilpo-pro' ); ?>
						</p>
					</div>
					<button id="lipishilpo-test-api" class="lipishilpo-test-btn" type="button">
						<span>📡</span> <?php esc_html_e( 'Test Connection', 'lipishilpo-pro' ); ?>
					</button>
				</div>
				<div id="lipishilpo-test-result-container" class="lipishilpo-test-result-box">
					<span id="lipishilpo-test-result"></span>
				</div>
			</div>
		</div>

		<!-- Card 2: Pro License Settings -->
		<div class="lipishilpo-card-section">
			<div class="lipishilpo-card-header">
				<div class="lipishilpo-card-header-icon" style="background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe;">💎</div>
				<div>
					<h2 class="lipishilpo-card-title"><?php esc_html_e( 'লিপিশিল্প প্রো লাইসেন্স ও প্রিমিয়াম আপডেট', 'lipishilpo-pro' ); ?></h2>
					<span class="lipishilpo-card-tag"><?php esc_html_e( 'Pro License & Automatic Updates Gate', 'lipishilpo-pro' ); ?></span>
				</div>
			</div>
			<p class="lipishilpo-card-subtitle">
				<?php esc_html_e( 'lipishilpo.com থেকে প্রাপ্ত প্রো লাইসেন্স কি প্রবেশ করিয়ে সমস্ত প্রিমিয়াম সুবিধা ও অটোমেটিক আপডেট সক্রিয় রাখুন।', 'lipishilpo-pro' ); ?>
			</p>

			<div class="lipishilpo-field-group">
				<label for="lipishilpo_license_key" class="lipishilpo-field-label">
					<span>🛡️</span> <?php esc_html_e( 'Pro License Key', 'lipishilpo-pro' ); ?>
				</label>
				<div style="max-width: 480px;">
					<input
						type="password"
						id="lipishilpo_license_key"
						name="lipishilpo_license_key"
						value="<?php echo esc_attr( $license_key ); ?>"
						class="lipishilpo-input-control"
						placeholder="LPS-XXXX-XXXX-XXXX"
						autocomplete="off"
					/>
				</div>
				<p class="lipishilpo-field-help" style="margin-top: 8px;">
					<?php if ( $license_key && $license_status === 'valid' ) : ?>
						<span style="color: #16a34a; font-weight: 600;">✅ লাইসেন্স কি সংরক্ষিত এবং সমস্ত প্রো ফিচার আনলক করা রয়েছে।</span>
					<?php else : ?>
						<span>lipishilpo.com থেকে প্রাপ্ত লাইসেন্স কি এখানে দিন। লাইসেন্স সংরক্ষিত থাকলে ফিচার সক্রিয় থাকবে।</span>
					<?php endif; ?>
				</p>
			</div>
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
				if (baseUrlRow) {
					baseUrlRow.style.display = info.has_base_url ? 'flex' : 'none';
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
				if (customModelRow && modelSelect) {
					customModelRow.style.display = (modelSelect.value === 'custom') ? 'flex' : 'none';
				}
			}

			if (providerSelect) {
				providerSelect.addEventListener('change', updateUI);
			}
			if (modelSelect) {
				modelSelect.addEventListener('change', updateCustomModelVisibility);
			}

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
		<?php
	}
}
