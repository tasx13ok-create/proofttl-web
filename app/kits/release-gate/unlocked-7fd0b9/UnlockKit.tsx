'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

const ENCRYPTED_PAYLOAD = 'enc:v1:0L1o6AqlgqBY7OHM:M5SATPdamhBzq8b9J2satxgspMnLP8aw6aPAcgkoyjFW8sdidYIF6rpMo0n_qI6JjGFQdaf-GUoEJGtR7ntw_8MS5l0M900hy3_bnaj2wcShVFRtRqEn2K4jtUKJVZESOt0rRONCauIIxJ6WGgfVLkl469V0vN-0KAnlEq8F2kvDXMXx-hw5scwGEhj6B4NpW8DAFfxBWq9M7rdvHk9BcVkCgPo7coLjoZMPul6vJkMIUcJlcGgnsoWI48KBul4yUB5ZzfKQ7Ks1T3_XULyUrnoSqd71X8eBkVNkEtavXpUdr_ew70L97SZ1mArQTh5DGsGeSsTGlet3gnewvPjDRIljMTJGtoXQq_-bDvAj_Z7Nv560ARAzXMuHa9RsZN9NDRYNhfbKT-KHuEhQQyLMilNL6NVOWyiLzowzi7az50907tqKTxKvtZmMfz-wdY611tM_6qa-iBjdAH4iS-gvqe_reWCMWBN4dslFKz4qo2trNMovf-mrz0JTdKnZJKC-T0WTKP4HgoZ6RvOslm62kt152_B6sGkiIPyWgLPWpfgOSCNEsjrRmufUrEUmnJIRtjc7ytYZtO8fzi9c6Cqp-3hJevERW1Vlz0yKHfTK7rRzKA09jXG715Wx--lE1eMWqwxd6SSRNTaTjsrLr9aUV3eezaFoOZgKR4quPDJ-X1Rn4lAGu0Jt01Rf0pQZWqC24fKzlZzGXAj5VslpRRaL8J61ibZbULFC_8GVj9_WyPxdxfxZryU_DYidZrh3tmcmR4bgyIoxtj-EHMJBpFHo3NR4JfJ4Kn7WWlaeoThWnqTcokUAYwa9DlygcMnrlkuWirxPy9Cwpcony01H-xqAnFrhtX0QiZKLQ_c8rM1dqRulbQiK8ZwPv1gUT6zL3ZcqzJhBpiYVQL1jr1LIHlID0W8fyv_QU_JwYvUojeoy-aM62GLVOXz5cG26vi8Rya05yvGCuPZMeY9X4r0MRgzkWcZ3_BvXAavyrCNcG-VZbCe5CbGEjtjtGg_9ep9xPrJ9oQel42Ib4oudAAmNTMdUgeQfJ0w3uKjCV1FJ1q6jGcQ8yiifWMr0b6Ki9WDrwbl5OxA3iDVt2OfTkSuX4CecrCTqcBj-EF6qo_NVa96K-FRdAzR0cBzgue3Oayc2hHV7xhJDhzDTZQkbZ5ip9HmJ8Md4rXpGj31VmS5krkMeAcE5qeSS5cJQiB85l2MVL8nm4lePBeuU9OXQrExLkJCbh4taLMilrc_PlsU--yRff_YsDFUKpbdLVQfL6w-EH-Cmv3blpQeoDPCMUNE-zTDdTtvGLMAYNQraN0RXRbrB0MyIsqqFx5C6f8ZIknP6XQzMasWH4-SXMaSnb9qcVSm2k4OsG03LdYXCOSdl5C0O9UCtr5Sf2aWSjkrHA8JHu9HRo69DmqMz4D8sy6wn6ea03w7deZpJuX8aIcFhB_EO1lCz6nLQSZGepodeKaHk0yBdh1fojnWPSLzDEYEUWoid3WrnfkC39NH9OJoI_U_wvenO-PMqXhC5SSrHD9xEuHkpmBUOzXPc2zMQWnPDnx98EqYSQt5SDeDkGImRfFLNJ5RkJigGfWOVQ7hUXyQ0-xVU09gPE68HphcGlOpol_Qb9ixcJUu3NEL4wHyzqEdcw_IV0BAH9UGESM4wICBHlrvEbSf0y_LMPZ1TNnGFhoNParPkoZarg2fOs3r0V6pm8KHZKOJqULpFrQvZZZaxCvIIMqHxluQzSVI1jxd1pTHV1DElNkk-iYOMqgGwN1yoEK-cV6AMkP1prE7lZ30iluceGqc7646kbJw3f7Lg0sD5NTFPn-MFYX3VVkN84k3DT717YCU1uUbpW5sprbcEJUcn-wPYhKqXuEVV4a7RhGRLeiqaH3DteeL8LkXa6lTTZ30M6DwfEB9xHNPwzkQxT7bcKwoeT5stnB_H36eUVR5b-jr2jfD-AGcUOq_nOn81KijC1VDMNfXikXrm2qRyQsY7SHjXZ4WYafingywKhw0QhagFNNSp4wlQpAvRGyx2-B4wClA_lyUgjd_S1yGPIxJGtYA8vzchXSkEBKuqqoVhUDpnN1KGe7RfB45A7lfN1Oj_O_0Wuh8A89AIieZKVPaP4estT0sOYnnbcCRQihlquqnZo28imz23fkXX64uCv17nIL44SXWjiUkUSkKluHD0ZmG5G2pdSTKSzQM6XrfGb_tFMTx91xmFtHQVOrX0Kl6UkMfDeMolFeXENmjlY10zf9-PcAChjaLeS7LubzvMkD9JJX63BjHM10tf-_loPdNhfyWuBSshCX7B4q8ew9gY7QEIcOSmIk5ydXrQT5VlqEehMHvZUViIkMZoyKYwcJMaVzQg3gUONzWm3N7ZaUoA7XhhEYlR-1JT49zq_7oOy7-TRRERTYrdkyYvR9GVMUsXtxWnQsjj6_iwaeib8WfRJFuGCGkH0JoQppnjdlcmiWB28faLrZ1ibaDB8j_iIEwadyhLEJmKDIvRdku_3d4XeNLyuYQTO-nCESdxVLNogRs0y__DGRKOSX4X8RIippZzHZFSiwlm7E-NTwAJFzuTLdC2SMeo3RPmUO2QuTgk2E5PUOR1sXdNiZyFQ-NaQab7L4TDJ1m9UyKkj66O_GSdI3tQ8pjk-CzMuDxACmR4PfavBkGOKclChPJWuqrozpEqagAGoOSWkpMM-zNbkcyShmhVqmuvgzVISYyjH7kc5vSVB3AgRvyFkYmTCrylfi28Ozi1UKsEsslgE3fyUIS4rGMY1a8p4kRfT4WOA7C6IepD7vtbm5xXE85BmGj1naVPjZ9OLYstWmHNzoRmuJlJ8MhvFB2sE_fAfKDHr-mb9qh9IPZ_znCqtOfvwRwjyK-L_Kniqo29THaWwB27Y7AoO18qAA_wKi43c0IhARFQbIqlY-JMtlNuo8m7g8JSR0nHB5ERN2RCG8aWmyoOQXh5LqkACi5XrT725Nl3XspUG8WWFj8BmlnwyPnGDEjn_app7WJ7TE4Gj2Zd7rXBuUOPnKTHwUGVLd0XDLeXe6ja37tjZYnepB5QEt_WRKqXAB_ANgelM6Qn64Mw7Bym69Yv_uJ7AumecjJkp-UJ-AYjAJ0wjKKpMk1RPZ4gE_uanQrlSdztKomsc4t7mseqnBarNdAzmr-XvnpjR8QPl8yir7rLjzle9AjQfJRanyutDzXw6chJxICaUjymsdNrZ_chEHSHGTBPKXhlm9Ro_korDc7sr7OHbM5sr-gHZRKM5sr7C9MWn3t4PksogxatVaOKVZZpWafHnpsLmr8F8GFizbhCWjDD5NY_Brq47w1S26U2gmBk_YYXy0HWVu9k4dDBXHqLNFtrqA3rX_Q94uwGHU-VhNgX0n1SCvU5_nbHMw05LLq3gqzV3nYftuB5DoWPPX1wX7ECd1Kn2-qnFXfLcxcOyMJplsj_ZWgUROgW2p4JVNOsEkYgen5qynUVmYHP4n2cwhadCi2b8YaEH5LnSjXmHjnqOPX3sLchW68IwGUKIau8XaGr4DsCwVuduylKX1aku8PWzGQudyudfk9NcJUUbRU3kAge5oltWvw6gcwgbn5SV_bBOtyA-caaByaflhe4u-ovBvU1cOCVDlz7anuw-V6wR8fLCO-gLyAptuLyRcJlnbW19gPhOGIwmNYM3i3iNwsoLqFRpyOGtUz8-cZLdZv1VNwpBuhbUzR0Y3RMvBLtMSn249JjeIlIPdukrjxuThtFhtipnj1dwjHNJshMc3UBIvJORFRRC54gc2b9tcG9qB6-FIJw8NnjACHpxA9H2tPKdNQ4I5pxmvV6wiuEVQr9ytJa-YA5GZzWcYGyubbHeovIMXRj9lx3oqZeysLhqZdn-YS5ETuuGVuXQiHn2VBSnZvwgqOyDf5w2xHUoTez_PYJxCOGsSbdlD_XnN44mDQOnOvzmPbGlCYOC77gLcKB1WjJSJ-gQlXS376KtFdrP3xfFbXfMAh90XFW6yFv5LXAsMi9S-ZSnnsi5GLLtS5bUZstrPFeSk1L0MDIVjqH_C8_v46ufjN4TfJxdJcwrXJ-dTBqzc4PVnFH60kwaP6csxi8xbIJprwRajsCPYg4pVO4kXR8g7KXx3v-5cAvhU_1v8w6xzVvMaIKaCE28eLPgamibyCEw45w-1GCTPE0MROGuuqNzkS5ksJJ3CkFPIkbad_OWGTRRnOZ1S9ltunY0N_Oxd-yCvKygJ4MMICpPeskJXOm8LIjSqe8zw1i9bqUkTntU50Cc6T8meJ_GE0qjJX_ihVZEMxygzjGAwdPUOOLVWtMiKcL3kYwsUzq0qGHmFYXN1tKFtWzC9mQLSXnNFI9dlaFAmCH6nRnDPxjDExS3RDCN4ZjGBt5AdWgf5ZgwOqswSoiSmNHD1PaqPg1ey65Z6qXXOCe1oFm-3nQU30NWw6q840EU3MZ0LVUVKt6RYBCNZVfYL4aGR2zX84znp7JukgIWQU-uo-gZmu4rxfaTfH-HSdHKZxw4pQ8xjyG9fxWS0Ywd5ic5k70t8yd1uCJZ3U0WXa3Wqh3pcqT-DxOZbFME0ZHwlsiCq1PI9mpbPxUAlA21WsWIqXJBdAOzcahQzLBB-aTneSsF2zewLFWd328-OLt7iiew1jJkIhpJd3XkQjY2TPM28Daept81Jbq0V8XNkFVIjkPIMb_qPo9MzipDkhI8MCdb_CUBdN0MCKWYnz6qIAVTJI1zd9_vSC3w45TV_MKK38JZY3CMhIDpm2NKI2dHNuzLTvQnLXqUWJ5zSLrmBA7881MqTtSBbOzN8hMFnOV2dEEs4A'

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
