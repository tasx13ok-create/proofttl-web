'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

const ENCRYPTED_PAYLOAD = 'enc:v1:u7ARu5ZM7gId8cOe:ia95jiKJ5SCKVfazQRstgYFDSIWEZyrlO_QzL0wZOq_pOOYj28IjZG9wG82qkIhOzg8ATTXMVhBss0teeVZKUuwH64GR3drrLNPHr5DAniya37gSOYc9HvuhFtC4lQ8WXEulTqAP8ooS5rAPX9Bf7Dm4fNoMDcw14KM4u6YXNGEd2Onxlyza8GBu_gXReG1V-sIvUu0Dtjksn_K_EJH1DH4aR49Ds8gpmTBW_6EXmPRNwTvBYVPc2qzCm10EAjLQusQiZb5txBDgJ2FDNrGz3XbbtSrkUfrmpkRc0gIy7DuVsp6qJR4WyHVviVpjAgbRi8DbMqmdPgnztB01AxdODrGA-qD8aBC1B69O7YtS7wTx1UnQ76vOExr_vPtI5tBts_gQnoh0UNVWIg2FHY2GHHj9gcwXn9mivB8vOWPnCC4NjFkTJucJZc7y24Zaqad4qMRFrgbcXhH7-UiHTDnCpxRzDmTMbtUSV4_UkMwtwUTSFKpjcK8WuLHoiTEDBLWEYux8KA_McT60QOVQKZx9DzEc00xWgw_O9bg9IRcdPG1OmWxN1iPnaTxybYiwVGlkxJ9aWVmlzyat8sgeWQnnq0Y7zVaKecZLsnKfJI1RhAthrpfcA5FtaC8askEaoRGqEmGiYuWAiUXINwYSwfD861rCGk-47HoRam-PlP37pW6Ecr_EkKZDv-v7egBoQqSXIqz744awbkEPTq1_AyDCdHLqrTR30qfswBIFf6V4sOutXxfYEsSxc0ODsodhFjThLCJ5vP2iLLgaSL93G_8EwR1bSA-2TkXJh9pCdD0pU9woD6T0C_raezp5WpsAmCN7U_pwUe4xFCG7NHLOIJ1ACzmZd3K7do3ghsgpBaez8aITgOwGaV7xEK8H1x8JlU9TK8tFvJPMLm3A-EEl8Kb7mJDMcV6tjfJHkv022CWxX-Ab0EjGu8wnd43EwtaL9TgCcGQTI2eSspYaagMeiUGmwfaGQpZjVlDZrTV_Vj48BhBcoD3PZbJZnLLNx3WtZOkW8URHXB36_PCpYJqMvwV6jIsLZHKxAcahPYk0rH18s3XwWAwOqrxOsLV58T1t8fU2NUqN0RmyW-iYHEa6TXs-AJ1FFtwMWj633M1_J1m_xXAhYVgJYK0qaCMYcldMrOaIlzKiK_mnTIDzaNiJr__hQx21XdHAqN9hBZwhg8gwEvHM1iX1C9y-yGNb9LqOZl48EsH4xnj07V8wKupDb_61OUFn7Qxd8ht8jOiLZqREn0rsMq_3XhM75Isk6w3WnbRIoMDZZkR0quBEjIPS-uvScMRrjPumsBSiaQMJOspAxm1ATFI7Gesn0FlcACBt5ooJhiH13xO12qRmQ2q3_E74ooDFLmZL7e3H10F01_ZRdfbIt-5fMlkXI5qRDAaaINVDLL5UoRhA8ekcseVO6z1xVLIrrnT0u26i0bS9ZloSFAH1moQDoJlKcw_MadLCX1dRiSfDHVp0-YwHdeUWM2MFCc_M6uhU30dOLmrcr8nDcaw453-D01zcgB6FvHcgD4Gtt3eUVvXF-SpmHafMv05bRMLDOBM5owRS_M80N_OOaAF3b-toCPug-KR37VHMDIgnf5iKElH24KR-HLOzJSv3GeYPcEECqN9wLWDkoJGEmJRBYXi-U3XIYpynXhcbP2VMS_ROY2iMUzHVfoADN4d_DNMosgYbPqbW7EGoel5TiYQ2_Fbb61uvH6epCFcKjuIRDX6d4DH4WEzgJL2JvjpUrAmhFhUwBKqr1Uv2D8mvpaTWGooYDv6QvQTQ2wZZ-MxIFNc32utrXkajPKwur21yDsF6dgYXJDQvoanwa4sLe0EauRxNJsLj5LZYp3MlnQo4ppTAvMb1n7d_AQYwTqy8RAJ98v16l9cjM0jDebHYUNhqBWgki7QxnG2WkG8z-DjknHE26tdQBc_G7P5v6oX3ulXpEMlliTSJtrei6TsYQhTxD6QLwjh62idO8Eq8QboGudRFl1hoZXJQW4PexP6RDN4TlHDmVoE7WVVkZhN-gm4XFW796vsabpiiyv7s-qz7MRIaZy_S5LCKAVQ4otQiv0RHMRs4YdEKcT9zKrDpXrWoWeSSa4tEK7TFxrj2IzpOyVaZcT2lsGrwXUdBBmOnc2CUzq0rSggIoCIiAulIysNx1arw-ktYKX0EubYztLBktMAq9aSuojo9xDMw3PjbXsz_-_LEBzH5xLsso4WE89vLtwapxDNLsla_t_p5LlvHWVUk_DjoDRruNhqs5_V1OinuTEypooO3fGHrV-k550hWTjc4JNWQPex3lmfS0mCb_sTmDALo3FHgRQmm63QEHDYBwv8jzDeGjCas6thB_6fnTxYKfJZK9tyI8GSDaASBaAK47Nn1Ox4B4MiNb5RnyXmZBcBHru5ELGsuOUm2N2dwdiNupaa003Iq653LUBB3QXjrJz5v0iU7q1cn3nyCKJiQt7KG8JeBdtkm_4H7kO5DH-vUuEA-EOzV6PKEKG56ZD8HfZAG8k0te3DXJfY2NxcYasDQnaIH7IZk3xU6f_YpiX3CkPWrZoFkbWbvs5vT-jgZBmSdgdUX2k_RgYNEiluK5mBjoatJ6xlrTpAF7IUombpKSQeeBPoKtTSO6yMAn4cwrlfryWfkeoX0HMUs_4qijBJqFhJ61_66o7JseF212xL6Zy9CBLAQffcW-NZLIVaO1iJUa5XQV9zkLY9JGZsarihl_tMW2PcVkp9RFytn3RlDvtEXKT8Hg5DjwdCeaAWhNkl6XWkGjQAmK0LeZvSzD73G7dpZHFUfqvM4maIb2NhaDChTHmqNnxjUbrekdVglHFWbGnzBg0LzNjgPv7WAOFj7-jTXcOXrBEE2H-tnmeMwPAU6Oxm4q0ZMMcdAKHL4_NU7l0wqBt06ngEAiD555E05i4xcjQT73CR-haygBE1PECPmfwUmmToqLwdwIwzUAy0cAJb60MrWkBV10f_0a8kamx0DI8Yztrhw_U5cQ_gT50FOP1bNYHcNRyRysTVAQnSSkrtUtxDgD_0anVuyeLCcVYamle6DUkmmexwrAEFmJxK5tn9_d1bJrJbHd32eoWAHtV_eo9my9oanF5RpP5qi6Sfrz_3Djp3SM-58nnLPBbCinVIQoLfPH7QKh2MgdiyAjLSWqxAGmdZxJ6OFnZtlIU0FCi_QzkUei_roq7QeEns6Ggf_zBo9BeHdQFoRyNmj7xxtFzqO11IOpdUfhoA_symAtz_oD_l83F7U1cnS2_-djS9JhQ4FNiVRnhNzwkOjMOQt1eCOTwsEBV23GrFmEDhPTqxpAnjNmQu6uq_YWnB3nMNIz1uezDqRVIGY0MfWKJYMpTqkQ9QUdC9Fou-BStq5S_guqQPP-jGBTI3WDI770WfkHp-bjw1CEjWu_g3yhW5QtAW3naHzpYTduLl-bwKQE8Cf-8bb_5zGdviMkiK2EVhRyBEfrQCwN5UM-8lkGI2lBpnPmQv7g58e4AQuRU0wrYR71n3FqE_xkgxn5vZsnS-VBQIKj5TNF9ZZNKPxKwrIq1AgYKxOCT6PDGia5pU4UZtlaQ43rZi17KP1P5sVsJNIbkGWKNSkV-fCkVP9Mex7EOscC5zYMvN__M0TpESjcCpe5TCdHDVmxOLGkDK9EhHCmLQJcejXgUXswtyTmuN-4rZp7Ny_Dj5PbaJCNCLVPlP_zCPKVjFIxsBdbK8Eh3YI4X64i_OOfv52qE683JbZubh9W9KB0PMNU77dPUVY-vXCSA2_-mI-zBVV2ENgu-NmdGS2ssR0XT3jAMWPygINpgVoseoWvWpdr5PrOc0PAr1I_dcsbXfknTTopbYSFJBZfU4psA2YjmpPz4u-smcf4_Vv8_rTpNlvURYLa_r-XTXQNJMS4desNnvCSWYRMngTnnawsFyVwz6Hskwu-fld6cAmp8t-5KcKT70CuxzWtr2UbbxHoIIfC03HTJ807ObwjoDmvFBTgbuCIpj3BH35km_O1BHXrV19o9B_jivtEYctxhSx3qreHQJKrG5aTWOC-JFeKBirQHt82gJCMTBWtp1DFsxMmuuMA4UvIZCmx3Io1spWT-4OKyW98XkMQWAmSzdNixc2ZCyIFqUPxLMj9lwlhv5ROMFbOpkfTkqydV9dXo2maEg5gyZ7JHD7gaVfdzQctxfI4F1uS3GBKx0iJ-A89enY2-zyBkkC-PzO7GUQShyM8NI-hQmy129zYjbU4v0ZEYJHAlkQi-XKuHWpe6jFzqMWZSO3YZp2pmOswrMKCqMVknjKJprdzPMgAfDoQbwH1U62ui99det009ubRGKPrXPAAbAxOWjj1Xcm7Km7uq9U2vfHmzOoola3IKptHbHFMpGjlmkr0yqq46lEHdrtOnvEz3C1aJfHIkhU61XM7K5XCh5eT-asMeQFVE9gnOOtJEPa0X22Yk-scYjNLgxIxSeRhHZ6KeABUPYEPbqBhI13Tu4Kghw3Ay4K---cebnUKTJ-v9h4eNOqsfBVoVZJ8FafoWu1WmJpCtYwRGjlaBVQG818r97SBMvgKYi64YsoSJD6dQsyOcbOkPfrm8J9n0XTUfEuS6EuI2efaO9K0I8uPwfm6PK3yy-rcIXlujq3Z8J2kdnlzt09rlJ57smux3ujR-Kwwvq5KKe0aqkbO0HxQM9mAba32E2pFjGGIlmV6F3HbzObjY7aTotkPgsFYOpBr0-8_6IAlrpvFEO571u91shTYla-XR1lNoXpCv2W-dxaLX8LdW2RxHezq9spmyxZ-jpJg4VcnB4uVIinDG5w9FdAQPk'

function b64urlToBytes(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4)
  const raw = atob(padded)
  return Uint8Array.from(raw, ch => ch.charCodeAt(0))
}

async function decryptPayload(access: string) {
  if (!ENCRYPTED_PAYLOAD.startsWith('enc:v1:')) {
    throw new Error('Fulfillment payload is not connected yet.')
  }

  const [, , ivText, cipherText] = ENCRYPTED_PAYLOAD.split(':')
  if (!ivText || !cipherText) throw new Error('Invalid fulfillment payload.')

  const keyBytes = b64urlToBytes(access)
  if (keyBytes.byteLength !== 32) throw new Error('Invalid access token.')

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  )

  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64urlToBytes(ivText) },
    key,
    b64urlToBytes(cipherText),
  )

  return new TextDecoder().decode(plain)
}

export default function UnlockKit() {
  const [kit, setKit] = useState('')
  const [status, setStatus] = useState('Checking purchase access…')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const access = params.get('access')

    if (!access) {
      setStatus('A valid post-purchase access token is required.')
      return
    }

    decryptPayload(access)
      .then(value => {
        setKit(value)
        setStatus('')
        history.replaceState(null, '', window.location.pathname)
      })
      .catch(err => {
        setStatus(err instanceof Error ? err.message : 'Unable to unlock this purchase.')
      })
  }, [])

  async function copy() {
    if (!kit) return
    await navigator.clipboard.writeText(kit)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function download() {
    if (!kit) return
    const blob = new Blob([kit], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'proofttl-release-gate-kit-v1.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className={styles.shell}>
      <section className={styles.top}>
        <div className={styles.kicker}>PURCHASE ACCESS · NOINDEX</div>
        <h1>Release Gate Kit</h1>
        {status ? (
          <p>{status}</p>
        ) : (
          <>
            <p>Access verified by the post-purchase token. Save a local copy now; the token is removed from the address bar after decryption.</p>
            <div className={styles.actions}>
              <button onClick={copy}>{copied ? 'Copied' : 'Copy full kit'}</button>
              <button onClick={download}>Download .txt</button>
            </div>
          </>
        )}
      </section>
      {kit ? <pre>{kit}</pre> : null}
      <footer><a href="/">ProofTTL</a> · Evidence &gt; confidence.</footer>
    </main>
  )
}
