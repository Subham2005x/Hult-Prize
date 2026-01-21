import { ImageResponse } from 'next/og'

export const size = {
    width: 32,
    height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#4F46E5',
                }}
            >
                <div
                    style={{
                        width: '18px',
                        height: '14px',
                        background: 'white',
                        borderRadius: '2px',
                        position: 'relative',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            right: '3px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '3px',
                            height: '3px',
                            background: '#4F46E5',
                            borderRadius: '50%',
                        }}
                    />
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
