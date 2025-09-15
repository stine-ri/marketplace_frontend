import React, { useState } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

const TermsAndConditions = () => {
  const [isOpen, setIsOpen] = useState<{[key: string]: boolean}>({
    '1': true,
    '2': false,
    '3': false,
    '4': false,
    '5': false,
    '6': false,
    '7': false,
    '8': false,
    '9': false,
    '14': false,
    '15': false,
    '16': false,
    '17': false,
  });

  const toggleSection = (section: string) => {
    setIsOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 md:p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Terms and Conditions</h1>
          <p className="opacity-90">Quisells Technologies and Solutions</p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="mb-6">
            <p className="text-justify">
              Welcome to <strong>Quisells Technologies and Solutions</strong> (hereinafter referred to as "Quisells"). 
              Quisells provides application features and other products and services to you when you visit or shop at 
              quisells web application, use quisells products or services, use Quisells web application, or use the 
              software provided by Quisells in connection with any of the foregoing (collectively, "Quisells Services").
            </p>
          </div>

          {/* Section 1 */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-800 mb-3"
              onClick={() => toggleSection('1')}
            >
              <span>1. ACCEPTANCE OF TERMS</span>
              <span>{isOpen['1'] ? '−' : '+'}</span>
            </button>
            
            {isOpen['1'] && (
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-purple-600">1.1.</span>
                  <p className="text-justify ml-4">
                    By accessing the Quisells, you confirm your understanding of the Terms and Conditions & Privacy Policies 
                    (hereinafter referred to as "this Agreement"). If you do not agree to this Agreement, you shall not use 
                    Quisells Services. By completing the registration process, and clicking on the "I agree with the Terms 
                    and Conditions & Privacy Policies", you agree to be bound by this Agreement and this Agreement takes effect.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">1.2.</span>
                  <p className="text-justify ml-4">
                    The Quisells Services provides a place and opportunity for the sale of goods and services between sellers 
                    and the users. The actual sales contract is directly between the seller and the user and Quisells is not a 
                    party to that or any other contract between the seller and the user and accepts no obligations in connection 
                    with any such contract. The seller and the user to such transaction will be entirely responsible for the sales 
                    contract between them, the listing of goods, warranty of purchase, and the like.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">1.3.</span>
                  <p className="text-justify ml-4">
                    Quisells shall have the right to change, upgrade, modify, limit or suspend service or its related feature. 
                    Please focus on the announcement on its own, without prior notice. Quisells shall have the right to further 
                    introduce new features, applications, or other services.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">1.4.</span>
                  <p className="text-justify ml-4">
                    This Agreement is intended for Kenyan users only.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 2 */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-800 mb-3"
              onClick={() => toggleSection('2')}
            >
              <span>2. REGISTRATION</span>
              <span>{isOpen['2'] ? '−' : '+'}</span>
            </button>
            
            {isOpen['2'] && (
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-purple-600">2.1.</span>
                  <p className="text-justify ml-4">
                    You may need your Quisells account to use certain Quisells Services, and you may be required to be logged 
                    into the account and have a valid payment method associated with it. If there is a problem with the payment 
                    method you have selected, alternative payment methods are also available for you to complete payment. You 
                    are responsible for maintaining the confidentiality of your account and password and for restricting others 
                    to have access to your account, and you agree to accept responsibility for all activities that occur under 
                    your account or password.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">2.2.</span>
                  <p className="text-justify ml-4">
                    When you complete the registration process or use any of the Quisells Services, you confirm that you have 
                    reached the legal age and have full legal capacity, and can independently bear legal responsibility. All 
                    responsibility will be borne by you and your guardian in case that you have no legal capacity and cause losses.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 border-l-4 border-blue-500 rounded-r-md my-4">
                  <strong>Important:</strong> Users should be honest about Quisells registration information and provide true, 
                  accurate, complete, legal, and effective registered information.
                </div>

                <div>
                  <span className="font-semibold text-purple-600">2.3.</span>
                  <p className="text-justify ml-4">
                    Users should be honest about Quisells registration information. Users agree to provide the true, accurate, 
                    complete, legal, and effective registered information and any change of user registration information should 
                    be timely updated. If any user registration information is illegal, untrue, inaccurate, not exhaustive, the 
                    user must bear the corresponding responsibility and consequences, and Quisells reserves the right to terminate 
                    this Agreement.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">2.4.</span>
                  <p className="text-justify ml-4">
                    Your information shall not be an infringement or alleged infringement of others' legitimate rights and interests. 
                    In case of infringement, Quisells shall have the right to cancel your account and Quisells reserves the right to 
                    pursue responsibility.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">2.5.</span>
                  <p className="text-justify ml-4">
                    You should be careful and reasonable to store and use your user name and password, login by your user name and 
                    password on the implementation of responsible behavior. Unless there is a law or judicial decision to the contrary 
                    and has the permission of the Quisells, otherwise, the user name and password cannot in any manner be transferred, 
                    given as gifts, or inherited (except property rights related to the account).
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">2.6.</span>
                  <p className="text-justify ml-4">
                    Users cannot share registration account information with others or save the account information on other's devices, 
                    otherwise, the consequences will be borne by the users themselves, and are jointly and severally liable with the 
                    actual user.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">2.7.</span>
                  <p className="text-justify ml-4">
                    If you are underage, as per the law of Kenya, you shall use the Quisells Services only with the consent of a parent 
                    or guardian. Some products such as alcohol and sex products listings on Quisells are intended for adults only, and 
                    you must be of the legal age to purchase. You must also satisfy all other relevant requirements according to the 
                    applicable laws and regulations. Quisells reserves the right to refuse service, terminate accounts, terminate your 
                    rights to use Quisells Services, remove or edit content, or cancel orders at its sole discretion.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3 */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-800 mb-3"
              onClick={() => toggleSection('3')}
            >
              <span>3. PRIVACY AND AUTHORIZATION</span>
              <span>{isOpen['3'] ? '−' : '+'}</span>
            </button>
            
            {isOpen['3'] && (
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-purple-600">3.1.</span>
                  <p className="text-justify ml-4">
                    Your privacy is very important to us at Quisells. Quisells will keep strictly confidential of users' information 
                    and activities on website and application, such as browsing, shopping, placing orders, and sharing printing, which 
                    involves the user's real name/contact name, address, telephone, email, and other private information. Unless 
                    authorized by users or otherwise provided in this Agreement or by law, Quisells will not disclose to the outside 
                    world of user privacy information.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">3.2.</span>
                  <p className="text-justify ml-4">
                    Quisells may contact you using autodialed or prerecorded calls or text messages or emails to: (i) notify you 
                    regarding your account; (ii) troubleshoot problems with your account; (iii) resolve a potential dispute; (iv) poll 
                    your opinions through surveys or questionnaires; or (v) as otherwise necessary to provide services in connection 
                    with your account or enforce this Agreement, our policies, applicable law, or any other agreement we may have with 
                    you. Quisells may also contact you using autodialed or prerecorded calls or text messages or emails for marketing 
                    purposes (e.g., offers and promotions) if you consent to such communications.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">3.3.</span>
                  <p className="text-justify ml-4">
                    Quisells may share your telephone number and email with its authorized service providers. These service providers 
                    may contact you using autodialed or prerecorded calls or text messages or emails, only as authorized by Quisells 
                    to carry out the purposes identified above.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">3.4.</span>
                  <p className="text-justify ml-4">
                    You have the right to request for deletion of any of your private information by writing a message through contact 
                    us button in the Quisells application. We will respond to such messages in Kenya working days during normal office hours.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">3.5.</span>
                  <p className="text-justify ml-4">
                    If you find any illegal use which may endanger the safety of your account or any improper use of your private 
                    information you must immediately notify, in a useful way for Quisells to suspend relevant services and to report 
                    to the public security organization. Please understand that Quisells needs a reasonable period of time to take 
                    certain measures and that Quisells is not responsible for any of your losses unless such illegal or improper use 
                    is due to Quisells's fault and Quisells refuses to remedy such illegal or improper use after receiving a written 
                    notice from your side.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 4 */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-800 mb-3"
              onClick={() => toggleSection('4')}
            >
              <span>4. INTELLECTUAL PROPERTY</span>
              <span>{isOpen['4'] ? '−' : '+'}</span>
            </button>
            
            {isOpen['4'] && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">4.1. Copyright & Trademark</h3>
                  
                  <div className="ml-4 space-y-4">
                    <div>
                      <span className="font-semibold text-purple-600">4.1.1.</span>
                      <p className="text-justify ml-4">
                        All content included in or made available through any Quisells Services, such as text, graphics, logos, 
                        button icons, images, audio clips, digital downloads, data compilations, software, etc is the property of 
                        Quisells or its content suppliers and protected by international copyright laws. The compilation of all 
                        content included in or made available through any Quisells Service is the exclusive property of Quisells 
                        and protected by international copyright laws.
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-purple-600">4.1.2.</span>
                      <p className="text-justify ml-4">
                        Quisells is the only owner of all rights or legal licensee allowed to provide the Quisells Services, which 
                        reflects the commercial secrets and intellectual property rights protected by relevant laws. All title, 
                        ownership, and intellectual property in relation to the Quisells Services are hereby reserved by Quisells 
                        and/or its affiliates.
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-purple-600">4.1.3.</span>
                      <p className="text-justify ml-4">
                        The trademarks of "Quisells" and relevant logos, icons, trade names, domain names and other marks (no matter 
                        registered or not) (hereinafter collectively the "Marks") belong to Quisells and/or its affiliates, and are 
                        subject to the legal protection of copyright, trademark rights, and other intellectual property rights. 
                        Unauthorized reproduction, modification, use, or publishing of the Marks is strictly prohibited.
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-purple-600">4.1.4.</span>
                      <p className="text-justify ml-4">
                        In addition, graphics, logos, page headers, button icons, scripts, and service names included in or made 
                        available through any Quisells Services are trademarks or trade dress of Quisells in Kenya and other countries. 
                        Quisells's trademarks and trade dress may not be used in connection with any product or service that is not 
                        Quisells, in any manner that is likely to confuse customers, or in any manner that disparages or discredits 
                        Quisells. All other trademarks not owned by Quisells that appear in any Quisells Services are the property of 
                        their respective owners, who may or may not be affiliated with, connected to, or sponsored by Quisells.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">4.2. License and Access</h3>
                  <p className="text-justify ml-4">
                    Subject to your compliance with this Agreement and any other requirements under the relevant laws and regulations, 
                    and your payment of any applicable fees, Quisells or its content providers grant you a limited, non-exclusive, 
                    non-transferable, non-sublicensable license to access and make personal and non-commercial use of the Quisells 
                    Services. This license does not include any resale or commercial use of any Quisells Services, or its contents; 
                    any collection and use of any product listings, descriptions, or prices; any derivative use of any Quisells Services 
                    or its contents; any downloading, copying, or other use of account information for the benefit of any third party; 
                    or any use of data mining, robots, or similar data gathering and extraction tools.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">4.3. Intellectual Property Release</h3>
                  
                  <div className="ml-4 space-y-4">
                    <div>
                      <span className="font-semibold text-purple-600">4.3.1.</span>
                      <p className="text-justify ml-4">
                        Any person engaging Quisells during any of its activities, such as competitions, award prize sessions, any events, 
                        among others resulting in their photograph being taken or such a person shares a photo of themselves with Quisells, 
                        such a person gives Quisells an unlimited, non-exclusive right to use the image or motion pictures for Quisells's activities.
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-purple-600">4.3.2.</span>
                      <p className="text-justify ml-4">
                        A person issuing such a right holds Quisells harmless for any claim brought against Quisells and will indemnify 
                        Quisells for any type of costs or damages it incurs for being authorized to use the photographs, and whereby such 
                        a person did not have the authority to issue the permission issued herein.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5 */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-800 mb-3"
              onClick={() => toggleSection('5')}
            >
              <span>5. MEDICINAL SUBSTANCES</span>
              <span>{isOpen['5'] ? '−' : '+'}</span>
            </button>
            
            {isOpen['5'] && (
              <div className="space-y-4">
                <div className="bg-red-100 p-4 border-l-4 border-red-500 rounded-r-md">
                  <strong>Important Notice:</strong> Quisells Technologies and Solutions does not present or intend to present itself as a pharmaceutical organization.
                </div>

                <div>
                  <span className="font-semibold text-purple-600">5.1.</span>
                  <p className="text-justify ml-4">
                    Quisells Technologies and Solutions does not present or intend to present itself as a pharmaceutical organization. 
                    However, the Company acknowledges that there are numerous risks if its platform is not well utilized as per the laws 
                    of the Republic of Kenya.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">5.2.</span>
                  <p className="text-justify ml-4">
                    This subclause is applicable towards any person that is regulated or engages in any products that are regulated by 
                    the Pharmacy and Poisons Board (PPB). Quisells Technologies and Solutions requires that any person (whether it is a 
                    natural person, incorporated, unincorporated or howsoever structured) regulated or engaging in any product that is 
                    regulated by the PPB will have to comply with the regulatory framework in Kenya prior to utilizing the Company's 
                    platform to be enrolled on the platform, list, market or sale any of the products it has at its disposal.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">5.3.</span>
                  <p className="text-justify ml-4">
                    The Company's platform shall not be used in listing, marketing, or selling of all products regulated and approved by 
                    the PPB. The Company will only allow a seller, upon complying with the Company's checklist or any additional requirements, 
                    to list, market or sale General Medicinal Substances as approved by the PPB.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">5.4.</span>
                  <p className="text-justify ml-4">
                    The Company reserves the right to suspend a seller's account if such a seller is not in compliance with the provisions 
                    of the laws of the Republic of Kenya. Further, any violation will result in having the seller's or intended seller's 
                    personal and business information, among other details, being forwarded to PPB or any government body, such information 
                    shall be shared, and the Company will not be deemed to be in breach of whatsoever regulatory framework.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">5.5.</span>
                  <p className="text-justify ml-4">
                    You will hold the Company harmless in all aspects and should the Company be charged for any offense or sued or require 
                    suing, the Company will substitute its name with your name. Failure to substitute does not mean the Company has or 
                    intends to accept liability.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 6 */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-800 mb-3"
              onClick={() => toggleSection('6')}
            >
              <span>6. REVIEWS, COMMENTS, COMMUNICATIONS, AND OTHER CONTENT</span>
              <span>{isOpen['6'] ? '−' : '+'}</span>
            </button>
            
            {isOpen['6'] && (
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-purple-600">6.1.</span>
                  <p className="text-justify ml-4">
                    You may post reviews, comments, photos, videos, and other content; send e-cards and other communications; and submit 
                    suggestions, ideas, comments, questions, or other information, so long as the content is not illegal, obscene, 
                    threatening, defamatory, invasive of privacy, infringing of intellectual property rights (including publicity rights), 
                    or otherwise injurious to third parties or objectionable, and does not consist of or contain software viruses, political 
                    campaigning, commercial solicitation, chain letters, mass mailings, or any form of "spam" or unsolicited commercial 
                    electronic messages.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">6.2.</span>
                  <p className="text-justify ml-4">
                    If you do post content or submit material, and unless we indicate otherwise, you grant Quisells a nonexclusive, 
                    royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, perform, 
                    translate, create derivative works from, distribute, and display such content throughout the world in any media.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">6.3.</span>
                  <p className="text-justify ml-4">
                    If you post product comments or share the content, it shall be deemed that the user is willing to make the comments 
                    public and shall be responsible for the comments, even if the comments are made public on off-site platforms (including 
                    but not limited to search engines) through non-platform active exposure.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 7 */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-800 mb-3"
              onClick={() => toggleSection('7')}
            >
              <span>7. RETURNS, REFUNDS</span>
              <span>{isOpen['7'] ? '−' : '+'}</span>
            </button>
            
            {isOpen['7'] && (
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-purple-600">7.1.</span>
                  <p className="text-justify ml-4">
                    Users may apply for goods return and refund under certain conditions for the following items:
                  </p>
                  <div className="ml-8 space-y-1 mt-2">
                    <div><span className="font-semibold text-purple-600">7.1.1.</span> Product description does not match;</div>
                    <div><span className="font-semibold text-purple-600">7.1.2.</span> The wrong goods;</div>
                    <div><span className="font-semibold text-purple-600">7.1.3.</span> Counterfeit products;</div>
                    <div><span className="font-semibold text-purple-600">7.1.4.</span> Parts or missing products (PART RECEIPT OF ORDER);</div>
                    <div><span className="font-semibold text-purple-600">7.1.5.</span> Defective products;</div>
                    <div><span className="font-semibold text-purple-600">7.1.6.</span> At our discretion, a refund may be issued without requiring a return. In this situation, Quisells does not require the item to be returned.</div>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">7.2.</span>
                  <p className="text-justify ml-4">
                    Without limiting the generality of the foregoing, Quisells does not accept returns for the following items:
                  </p>
                  <div className="ml-8 space-y-1 mt-2">
                    <div><span className="font-semibold text-purple-600">7.2.1.</span> Products not purchased from Quisells (order serial numbers does not match);</div>
                    <div><span className="font-semibold text-purple-600">7.2.2.</span> Products that exceed the expiry date (exceed warranty period);</div>
                    <div><span className="font-semibold text-purple-600">7.2.3.</span> Unauthorized repair, misuse, collision, negligence, abuse, into the liquid, accident, alteration, product quality problems caused by improper installation, or torn, altered labels of machine serial number or anti-counterfeiting mark;</div>
                    <div><span className="font-semibold text-purple-600">7.2.4.</span> The warranty card does not match the product and was altered;</div>
                    <div><span className="font-semibold text-purple-600">7.2.5.</span> Underwear, adult product, or anything similar products;</div>
                    <div><span className="font-semibold text-purple-600">7.2.6.</span> Global order for non-defective products or right product;</div>
                    <div><span className="font-semibold text-purple-600">7.2.7.</span> Items missing the accessories or without free gift;</div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 border-l-4 border-blue-500 rounded-r-md">
                  <div>
                    <span className="font-semibold text-purple-600">7.3.1.</span>
                    <p className="text-justify ml-4">
                      Once the customer(user) pays for the product or service, the money will reflect to the seller/service provider but 
                      will only be available to the seller once the product has been delivered to the user in perfect condition or the 
                      service has been provided. If the product is not delivered or service to given, the user(customer) can reverse his/her money.
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-purple-600">7.3.2.</span>
                    <p className="text-justify ml-4">
                      If a seller or service provider gets 20 bad reviews, the account will be suspended for 6 months. 30 bad reviews 
                      will lead to termination of the user account.
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-purple-600">7.3.3.</span>
                    <p className="text-justify ml-4">
                      For more information about our returns and refunds, please see our After-sales Return Policy.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 8 */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-800 mb-3"
              onClick={() => toggleSection('8')}
            >
              <span>8. PRODUCT DESCRIPTIONS</span>
              <span>{isOpen['8'] ? '−' : '+'}</span>
            </button>
            
            {isOpen['8'] && (
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-purple-600">8.1.</span>
                  <p className="text-justify ml-4">
                    Quisells attempts to be as accurate as possible. However, Quisells does not warrant that product description or 
                    other content of any Quisells Services is accurate, complete, reliable, current, or error-free.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">8.2.</span>
                  <p className="text-justify ml-4">
                    Users understand that it's the responsibility of sellers to describe the products accurately and properly, and if 
                    a product is not as described, your sole remedy is applying for the return of the items which are in unused condition.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 9 */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-800 mb-3"
              onClick={() => toggleSection('9')}
            >
              <span>9. PRICING</span>
              <span>{isOpen['9'] ? '−' : '+'}</span>
            </button>
            
            {isOpen['9'] && (
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-purple-600">9.1.</span>
                  <p className="text-justify ml-4">
                    "List Price" means the suggested retail price of a product as provided by sellers. We regularly check List Prices 
                    against prices recently found on Quisells and other sellers, but Quisells does not assume any responsibility for 
                    the reasonableness and legitimacy of such List Prices.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">9.2.</span>
                  <p className="text-justify ml-4">
                    With respect to items as listed on Quisells applications, we cannot confirm the price until you order. If the price 
                    of an item as listed is greatly higher than the market price, we may shelf off the item at our discretion. If you 
                    find that the price of the same product is inconsistent, it is probably because the product is supplied by different 
                    merchants or sellers.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 14 */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-800 mb-3"
              onClick={() => toggleSection('14')}
            >
              <span>14. LIMITATION OF LIABILITY</span>
              <span>{isOpen['14'] ? '−' : '+'}</span>
            </button>
            
            {isOpen['14'] && (
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-purple-600">14.1.</span>
                  <p className="text-justify ml-4">
                    You understand and accept that Quisells shall not bear the liability for compensation of any damage caused by the 
                    following any situation, including but not limited to, profits, goodwill, use, data loss, or other intangible loss 
                    of damages; third-party use of your account or change your data without our consent; your misunderstanding on 
                    Quisells Services; any other loss associated with Quisells Service due to no willful fault of Quisells.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">14.2.</span>
                  <p className="text-justify ml-4">
                    Quisells is not liable, due to the legal provisions of force majeure, normal maintenance of the equipment of 
                    information network, information network connection failure, computer, communications or other system failures, 
                    power failures, labor dispute, the productivity and production data is insufficient, the judicial administrative 
                    organs of the command or the inaction of a third party caused the Quisells Services to be unavailable or delayed, 
                    and the data information and records were lost, but Quisells will assist in dealing with related matters.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">14.3.</span>
                  <p className="text-justify ml-4">
                    Quisells takes no responsibility and assumes no liability for any loss or damages to users arising from shipping 
                    information and/or payment information entered by users or wrong remittance by users in connection with the payment 
                    for the items purchased.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">14.4.</span>
                  <p className="text-justify ml-4">
                    If we are found to be liable, our liability to you or any third party shall in no case be more than the value of 
                    the goods (less freight, customs and duties, and other taxes or charges if any) purchased via Quisells applications.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 15 */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-800 mb-3"
              onClick={() => toggleSection('15')}
            >
              <span>15. YOUR REPRESENTATIONS AND WARRANTIES</span>
              <span>{isOpen['15'] ? '−' : '+'}</span>
            </button>
            
            {isOpen['15'] && (
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-purple-600">15.1.</span>
                  <p className="text-justify ml-4">
                    You represent and warrant that: i) you possess the legal capacity (and in the case of a minor, valid parent or 
                    legal guardian consent), right and ability to enter into this Agreement and to comply with its terms; and (ii) 
                    you will use the Quisells Services for lawful purposes only and in accordance with this Agreement and all 
                    applicable laws, rules, codes, directives, guidelines, policies and regulations.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">15.2.</span>
                  <p className="text-justify ml-4">
                    If the user violates this Agreement or violates the law and regulations, including but not limited to the use of 
                    hacking techniques (or other technical methods) for-profit and the use of the wallet (Quisells Account) withdrawal 
                    function to defraud, Quisells can cancel the account, freeze money in the account and reserve the right to pursue 
                    liability, including but not limited to reporting to relevant departments and requesting compensation for any losses.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 16 */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-800 mb-3"
              onClick={() => toggleSection('16')}
            >
              <span>16. GOVERNING LAW AND JURISDICTION</span>
              <span>{isOpen['16'] ? '−' : '+'}</span>
            </button>
            
            {isOpen['16'] && (
              <div className="bg-blue-50 p-4 border-l-4 border-blue-500 rounded-r-md">
                <p className="text-justify">
                  This agreement shall be governed by, construed, and enforced in accordance with the laws of the Republic of Kenya. 
                  All disputes, controversies or differences that may arise between the parties, out of or in connection with this 
                  Agreement, or for the breach thereof, shall be finally settled by the Courts of the Republic of Kenya. The forum 
                  shall be in Kenya.
                </p>
              </div>
            )}
          </div>

          {/* Section 17 */}
          <div className="mb-6 border-b border-gray-200 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left text-xl font-semibold text-gray-800 mb-3"
              onClick={() => toggleSection('17')}
            >
              <span>17. GENERAL</span>
              <span>{isOpen['17'] ? '−' : '+'}</span>
            </button>
            
            {isOpen['17'] && (
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-purple-600">17.1.</span>
                  <p className="text-justify ml-4">
                    This Agreement shall include all policies and rules as may be published and amended on Quisells applications, 
                    including but not limited to the After-sales Return Policy and the Payments Information and Guidelines.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">17.2.</span>
                  <p className="text-justify ml-4">
                    If any provision of this Agreement shall be deemed unlawful, void, or for any reason unenforceable under the law 
                    of any jurisdiction, then that provision shall be deemed severable from these terms and conditions and shall not 
                    affect the validity and enforceability of any remaining provisions in such jurisdiction nor the validity and 
                    enforceability of the provision in question under the law of any other jurisdiction.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">17.3.</span>
                  <p className="text-justify ml-4">
                    Quisells reserves the unilateral right to modify this Agreement at any time by posting the revised agreement on 
                    its application or by other means of notification. Your continued access to Quisells or use of Quisells Services 
                    after such changes have been posted or notified shall constitute your acceptance of such revised agreement.
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-purple-600">17.4.</span>
                  <p className="text-justify ml-4">
                    If you have any questions or concerns or suggestions about this Agreement and any issues raised in this Agreement 
                    and Quisells Services, please contact us through the application.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 text-center border-t border-gray-200">
          <p className="text-gray-600 text-sm">&copy; 2024 Quisells Technologies and Solutions. All rights reserved.</p>
          <p className="text-gray-500 text-sm mt-1">Last updated: September 2024</p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;