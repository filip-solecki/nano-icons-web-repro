import {Icon} from "./Icon";

export default function Page() {
    return (
        <main>
            <h1>nano-icons web repro</h1>
            <p data-testid="icons" style={{display: "flex", gap: 12}}>
                <Icon name="ic_circle" />
                <Icon name="ic_square" />
                <Icon name="ic_star" />
                <Icon name="ic_opacity" />
            </p>
        </main>
    );
}
